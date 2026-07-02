/**
 * Vercel 서버리스 함수 (Node.js 런타임) — AI 성우(TTS)
 *
 * 마이크로소프트 Edge "읽어주기"가 쓰는 비공식 TTS 서버에 웹소켓으로 붙어
 * 텍스트를 mp3 음성으로 변환해 돌려준다.
 *
 * ⚠️ 왜 Cloudflare가 아니라 Vercel인가:
 *   Cloudflare Workers 런타임(workerd)의 아웃바운드 웹소켓은 edge-tts와
 *   핸드셰이크(101)까지는 되지만 오디오 데이터를 받지 못하고 끊긴다(검증 완료).
 *   Node.js 런타임에서는 표준 ws 클라이언트로 정상 동작한다. 그래서 Vercel(Node)에 둔다.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import WebSocket from 'ws'
import crypto from 'node:crypto'

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const GEC_VERSION = '1-143.0.3650.75'
const WIN_EPOCH = 11644473600 // 1601→1970 사이 초

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').toUpperCase()
}

// edge-tts 인증 토큰(Sec-MS-GEC) 생성
// 주의: 참조 구현(python edge-tts)이 float로 계산하므로(2^53 초과분 정밀도 손실 포함)
//       똑같이 float로 계산해야 서버가 기대하는 값과 일치한다. BigInt로 "정확히" 하면 403.
function generateSecMsGec(): string {
  let ticks = Math.floor(Date.now() / 1000) + WIN_EPOCH
  ticks -= ticks % 300 // 5분 단위로 내림
  ticks *= 1e7 // 100ns 단위(Windows ticks)로 변환
  return sha256Hex(ticks.toFixed(0) + TRUSTED_CLIENT_TOKEN)
}

function generateMuid(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase()
}

function dateString(): string {
  return new Date().toString() + ' (Coordinated Universal Time)'
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

function synthesize(
  text: string,
  voice: string,
  rate: string,
  pitch: string,
): Promise<Buffer> {
  const gec = generateSecMsGec()
  const connectionId = crypto.randomUUID().replace(/-/g, '')
  const url =
    `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1` +
    `?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&ConnectionId=${connectionId}` +
    `&Sec-MS-GEC=${gec}` +
    `&Sec-MS-GEC-Version=${GEC_VERSION}`

  const ws = new WebSocket(url, {
    headers: {
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

  const chunks: Buffer[] = []

  return new Promise<Buffer>((resolve, reject) => {
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { ws.close() } catch { /* noop */ }
      fn()
    }
    const timer = setTimeout(() => {
      finish(() => reject(new Error('TTS 응답 시간 초과 (30s)')))
    }, 30000)

    ws.on('open', () => {
      // 1) 오디오 출력 포맷 설정
      ws.send(
        `X-Timestamp:${dateString()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`,
      )
      // 2) SSML 전송
      const requestId = crypto.randomUUID().replace(/-/g, '')
      ws.send(
        `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${dateString()}\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml(text, voice, rate, pitch),
      )
    })

    ws.on('message', (raw: WebSocket.RawData, isBinary: boolean) => {
      // ws의 RawData(Buffer | ArrayBuffer | Buffer[])를 항상 단일 Buffer로 정규화
      const buf = Array.isArray(raw)
        ? Buffer.concat(raw)
        : Buffer.isBuffer(raw)
          ? raw
          : Buffer.from(raw as ArrayBuffer)
      if (!isBinary) {
        // 텍스트 제어 메시지
        if (buf.toString().includes('Path:turn.end')) {
          if (chunks.length === 0) {
            finish(() => reject(new Error('빈 응답을 받았어요. 잠시 후 다시 시도해주세요.')))
            return
          }
          finish(() => resolve(Buffer.concat(chunks)))
        }
      } else {
        // 바이너리 오디오 프레임: [2바이트 헤더길이][헤더][오디오]
        const headerLen = buf.readUInt16BE(0)
        const audio = buf.subarray(2 + headerLen)
        if (audio.length > 0) chunks.push(audio)
      }
    })

    ws.on('error', (e: Error) => {
      finish(() => reject(new Error(`웹소켓 오류: ${e.message}`)))
    })
    ws.on('close', () => {
      // turn.end 없이 닫혔는데 받은 오디오가 있으면 그거라도 반환
      if (chunks.length > 0) finish(() => resolve(Buffer.concat(chunks)))
      else finish(() => reject(new Error('오디오를 받지 못했습니다')))
    })
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 허용됩니다' })
    return
  }
  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const text = String(body.text ?? '').slice(0, 2000).trim()
    const voice = String(body.voice ?? 'ko-KR-SunHiNeural')
    const rate = String(body.rate ?? '+0%')
    const pitch = String(body.pitch ?? '+0Hz')

    if (!text) {
      res.status(400).json({ error: '대본이 비어 있습니다' })
      return
    }

    const audio = await synthesize(text, voice, rate, pitch)

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(audio)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'TTS 실패' })
  }
}
