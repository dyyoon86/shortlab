/**
 * Cloudflare Pages Function — AI 성우(TTS)
 *
 * 마이크로소프트 Edge의 "읽어주기"가 쓰는 비공식 TTS 서버에
 * 웹소켓으로 붙어서 텍스트를 mp3 음성으로 변환해 돌려준다.
 *
 * 브라우저에서는 이 프로토콜에 필요한 커스텀 헤더/토큰을 못 붙이기 때문에
 * (그리고 CORS 때문에) 반드시 이렇게 서버(함수)를 한 번 거쳐야 한다.
 *
 * 이 함수는 Cloudflare Workers 런타임의 아웃바운드 WebSocket 기능
 * (fetch + Upgrade: websocket → response.webSocket)을 사용한다.
 */

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const GEC_VERSION = '1-143.0.3650.75'
const WIN_EPOCH = 11644473600 // 1601→1970 사이 초

// SHA-256 → 대문자 hex
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

// edge-tts 인증 토큰(Sec-MS-GEC) 생성
// 주의: 참조 구현(python edge-tts)이 부동소수점으로 계산하므로(2^53 초과분 정밀도 손실 포함)
//       BigInt로 "정확히" 계산하면 서버가 기대하는 값과 달라져 403이 난다. 반드시 float 그대로 계산할 것.
async function generateSecMsGec(): Promise<string> {
  let ticks = Math.floor(Date.now() / 1000) + WIN_EPOCH
  ticks -= ticks % 300 // 5분 단위로 내림
  ticks *= 1e7 // 100ns 단위(Windows ticks)로 변환
  return sha256Hex(ticks.toFixed(0) + TRUSTED_CLIENT_TOKEN)
}

// MUID 쿠키 값 (32자리 대문자 hex)
function generateMuid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function dateString(): string {
  // 예: "Wed Jul 01 2026 13:00:00 GMT+0000 (Coordinated Universal Time)"
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${p(d.getUTCDate())} ${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function ssml(text: string, voice: string, rate: string, pitch: string): string {
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='+0%'>${escapeXml(text)}</prosody></voice></speak>`
}

async function synthesize(
  text: string,
  voice: string,
  rate: string,
  pitch: string,
): Promise<Uint8Array> {
  const gec = await generateSecMsGec()
  const connectionId = crypto.randomUUID().replace(/-/g, '')
  // CF Workers 아웃바운드 웹소켓은 https:// 스킴으로 fetch + Upgrade 헤더를 써야 한다 (wss:// 는 거부됨)
  const url =
    `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&ConnectionId=${connectionId}` +
    `&Sec-MS-GEC=${gec}` +
    `&Sec-MS-GEC-Version=${GEC_VERSION}`

  // Cloudflare Workers 아웃바운드 웹소켓
  // (Cookie: muid=... 가 없으면 서버가 403을 돌려준다)
  const resp = await fetch(url, {
    headers: {
      Upgrade: 'websocket',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      Cookie: `muid=${generateMuid()};`,
    },
  })
  const ws = (resp as any).webSocket as WebSocket | null
  if (!ws) {
    throw new Error(`웹소켓 업그레이드 실패 (status ${resp.status})`)
  }
  ws.accept()

  const requestId = crypto.randomUUID().replace(/-/g, '')
  const chunks: Uint8Array[] = []

  return new Promise<Uint8Array>((resolve, reject) => {
    const timer = setTimeout(() => {
      try { ws.close() } catch { /* noop */ }
      reject(new Error('TTS 응답 시간 초과'))
    }, 30000)

    ws.addEventListener('message', (evt: MessageEvent) => {
      const data = evt.data
      if (typeof data === 'string') {
        // 텍스트 제어 메시지
        if (data.includes('Path:turn.end')) {
          clearTimeout(timer)
          try { ws.close() } catch { /* noop */ }
          let total = 0
          for (const c of chunks) total += c.length
          if (total === 0) {
            // 간헐적으로 오디오 없이 turn.end만 오는 경우 → 빈 200 대신 에러로 처리(재시도 유도)
            reject(new Error('빈 응답을 받았어요. 잠시 후 다시 시도해주세요.'))
            return
          }
          const out = new Uint8Array(total)
          let off = 0
          for (const c of chunks) { out.set(c, off); off += c.length }
          resolve(out)
        }
      } else {
        // 바이너리 오디오 프레임: [2바이트 헤더길이][헤더][오디오]
        const buf = new Uint8Array(data as ArrayBuffer)
        const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
        const headerLen = view.getUint16(0)
        const audio = buf.subarray(2 + headerLen)
        if (audio.length > 0) chunks.push(audio)
      }
    })

    ws.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('웹소켓 오류'))
    })
    ws.addEventListener('close', () => {
      // turn.end 없이 닫히면(아직 미해결) 에러
      clearTimeout(timer)
      if (chunks.length === 0) reject(new Error('오디오를 받지 못했습니다'))
    })

    // 1) 오디오 출력 포맷 설정
    ws.send(
      `X-Timestamp:${dateString()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`,
    )

    // 2) SSML 전송
    ws.send(
      `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${dateString()}\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml(text, voice, rate, pitch),
    )
  })
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as {
      text?: string
      voice?: string
      rate?: string
      pitch?: string
    }
    const text = (body.text ?? '').slice(0, 2000).trim()
    const voice = body.voice ?? 'ko-KR-SunHiNeural'
    const rate = body.rate ?? '+0%'
    const pitch = body.pitch ?? '+0Hz'

    if (!text) {
      return new Response(JSON.stringify({ error: '대본이 비어 있습니다' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const audio = await synthesize(text, voice, rate, pitch)

    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'TTS 실패' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
