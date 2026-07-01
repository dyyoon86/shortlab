import { useRef, useState } from 'react'
import PageShell, { Card } from '../components/PageShell'

type Chunk = { timestamp: [number, number | null]; text: string }

// 초 → SRT 시간 형식 (00:00:00,000)
function fmt(sec: number) {
  const ms = Math.floor((sec % 1) * 1000)
  const s = Math.floor(sec) % 60
  const m = Math.floor(sec / 60) % 60
  const h = Math.floor(sec / 3600)
  const pad = (n: number, l = 2) => String(n).padStart(l, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function toSrt(chunks: Chunk[]) {
  return chunks
    .filter((c) => c.text.trim())
    .map((c, i) => {
      const start = c.timestamp[0] ?? 0
      const end = c.timestamp[1] ?? start + 2
      return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${c.text.trim()}\n`
    })
    .join('\n')
}

// 업로드된 미디어 파일을 16kHz 모노 Float32Array로 디코딩
async function decodeToMono16k(file: File): Promise<Float32Array> {
  const arrayBuf = await file.arrayBuffer()
  const AC: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext
  const tmpCtx = new AC()
  const decoded = await tmpCtx.decodeAudioData(arrayBuf)
  tmpCtx.close()

  const targetRate = 16000
  const offline = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * targetRate),
    targetRate,
  )
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  const rendered = await offline.startRendering()
  return rendered.getChannelData(0)
}

export default function Subtitle() {
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [downloads, setDownloads] = useState<Record<string, number>>({})
  const [srt, setSrt] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const run = async (file: File) => {
    setError(null)
    setSrt('')
    setDownloads({})
    setBusy(true)
    try {
      setStatus('영상에서 소리를 꺼내는 중…')
      const audio = await decodeToMono16k(file)

      setStatus('AI 모델 준비 중… (처음엔 다운로드로 시간이 걸려요)')
      const worker = new Worker(
        new URL('../whisperWorker.ts', import.meta.url),
        { type: 'module' },
      )
      workerRef.current = worker

      worker.onmessage = (e) => {
        const d = e.data
        if (d.type === 'download') {
          setDownloads((prev) => ({ ...prev, [d.file]: d.progress }))
        } else if (d.type === 'status') {
          setStatus(d.message)
        } else if (d.type === 'done') {
          setSrt(toSrt(d.result.chunks ?? []))
          setStatus('완료!')
          setBusy(false)
          worker.terminate()
        } else if (d.type === 'error') {
          setError(d.message)
          setBusy(false)
          worker.terminate()
        }
      }

      worker.postMessage({ audio }, [audio.buffer])
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
      setBusy(false)
    }
  }

  const dl = () => {
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitle.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageShell
      badge="자막 추출 · 무료 · 브라우저에서 처리"
      title="영상 자막 추출"
      desc="영상을 올리면 그 안의 한국어 말소리를 듣고 자막(SRT)으로 만들어 드려요. 파일은 서버로 올라가지 않고 브라우저 안에서만 처리돼요."
    >
      <Card>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-12 text-center transition hover:border-white/40">
          <span className="text-4xl">📹</span>
          <span className="font-semibold text-white">영상/오디오 파일 올리기</span>
          <span className="text-xs text-slate-400">mp4 · mov · mp3 · wav 등</span>
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

      {(busy || status) && (
        <Card>
          <div className="text-sm text-slate-200">{status}</div>
          {Object.entries(downloads).length > 0 && (
            <div className="mt-3 space-y-2">
              {Object.entries(downloads).map(([file, p]) => (
                <div key={file}>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span className="truncate">{file}</span>
                    <span>{Math.round(p)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-300 to-amber-200 transition-all"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {srt && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-300">자막 결과</div>
            <button
              onClick={dl}
              className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              ⬇ SRT 다운로드
            </button>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-slate-200">
            {srt}
          </pre>
        </Card>
      )}
    </PageShell>
  )
}
