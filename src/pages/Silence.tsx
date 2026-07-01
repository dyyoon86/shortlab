import { useState } from 'react'
import PageShell, { Card } from '../components/PageShell'

// AudioBuffer → WAV(Blob) 인코딩 (16-bit PCM)
function encodeWav(channels: Float32Array[], sampleRate: number): Blob {
  const numCh = channels.length
  const len = channels[0].length
  const buffer = new ArrayBuffer(44 + len * numCh * 2)
  const view = new DataView(buffer)
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + len * numCh * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numCh, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numCh * 2, true)
  view.setUint16(32, numCh * 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, len * numCh * 2, true)
  let off = 44
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      off += 2
    }
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

export default function Silence() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; before: number; after: number } | null>(null)
  // 민감도: 이 값(dB 근사)보다 조용하면 무음으로 간주. 값이 클수록 더 많이 잘라냄.
  const [threshold, setThreshold] = useState(0.02)

  const run = async (file: File) => {
    setError(null)
    setResult(null)
    setBusy(true)
    try {
      const arrayBuf = await file.arrayBuffer()
      const AC: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = new AC()
      const decoded = await ctx.decodeAudioData(arrayBuf)
      ctx.close()

      const rate = decoded.sampleRate
      const numCh = decoded.numberOfChannels
      const win = Math.floor(rate * 0.02) // 20ms 창
      const chans: Float32Array[] = []
      for (let c = 0; c < numCh; c++) chans.push(decoded.getChannelData(c))

      const keptChans: number[][] = Array.from({ length: numCh }, () => [])
      const total = chans[0].length

      for (let start = 0; start < total; start += win) {
        const end = Math.min(start + win, total)
        // 첫 채널 기준 RMS
        let sum = 0
        for (let i = start; i < end; i++) sum += chans[0][i] * chans[0][i]
        const rms = Math.sqrt(sum / (end - start))
        if (rms >= threshold) {
          for (let c = 0; c < numCh; c++)
            for (let i = start; i < end; i++) keptChans[c].push(chans[c][i])
        }
      }

      const out = keptChans.map((a) => Float32Array.from(a))
      if (out[0].length === 0) {
        throw new Error('전부 무음으로 판단됐어요. 민감도를 낮춰서 다시 시도해보세요.')
      }
      const blob = encodeWav(out, rate)
      setResult({
        url: URL.createObjectURL(blob),
        before: total / rate,
        after: out[0].length / rate,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell
      badge="무음 제거 · 무료 · 브라우저에서 처리"
      title="무음 제거"
      desc="영상·오디오에서 아무 소리도 없는 조용한 구간을 자동으로 찾아 잘라내요. 결과는 오디오(wav)로 나와요. 파일은 서버로 올라가지 않아요."
    >
      <Card>
        <div className="mb-4 text-sm font-bold text-gray-700">민감도</div>
        <input
          type="range"
          min={0.005}
          max={0.08}
          step={0.005}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>적게 자름</span>
          <span>많이 자름</span>
        </div>
      </Card>

      <Card>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50">
          <span className="text-4xl">🔇</span>
          <span className="font-semibold text-gray-900">영상/오디오 파일 올리기</span>
          <span className="text-xs text-gray-400">mp4 · mov · mp3 · wav 등</span>
          <input
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) run(f)
            }}
          />
        </label>
      </Card>

      {busy && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700">
          처리 중…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <Card>
          <div className="mb-3 text-sm font-bold text-gray-700">결과</div>
          <div className="mb-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="text-xs text-gray-400">원본 길이</div>
              <div className="text-lg font-bold text-gray-900">{result.before.toFixed(1)}초</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div className="text-xs text-blue-600/70">무음 제거 후</div>
              <div className="text-lg font-bold text-blue-700">{result.after.toFixed(1)}초</div>
            </div>
          </div>
          <audio controls src={result.url} className="w-full" />
          <a
            href={result.url}
            download="silence-removed.wav"
            className="mt-4 inline-flex rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ⬇ wav 다운로드
          </a>
        </Card>
      )}
    </PageShell>
  )
}
