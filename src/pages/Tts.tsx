import { useMemo, useState } from 'react'
import PageShell, { Card, StepTitle } from '../components/PageShell'

type Lang = 'ko' | 'ja' | 'en' | 'zh'

type Voice = {
  id: string // edge-tts voice name
  label: string
  gender: '여' | '남'
  desc: string
}

const LANGS: { id: Lang; label: string; code: string }[] = [
  { id: 'ko', label: '한국어', code: 'KR' },
  { id: 'ja', label: '일본어', code: 'JP' },
  { id: 'en', label: '영어', code: 'US' },
  { id: 'zh', label: '중국어', code: 'CN' },
]

const VOICES: Record<Lang, Voice[]> = {
  ko: [
    { id: 'ko-KR-SunHiNeural', label: '선희', gender: '여', desc: '밝고 명료 · 내레이션' },
    { id: 'ko-KR-InJoonNeural', label: '인준', gender: '남', desc: '차분 · 신뢰감 · 다큐' },
    { id: 'ko-KR-HyunsuMultilingualNeural', label: '현수', gender: '남', desc: '젊고 캐주얼 · 브이로그' },
  ],
  ja: [
    { id: 'ja-JP-NanamiNeural', label: '나나미', gender: '여', desc: '부드럽고 또렷함' },
    { id: 'ja-JP-KeitaNeural', label: '케이타', gender: '남', desc: '차분한 남성' },
  ],
  en: [
    { id: 'en-US-AriaNeural', label: 'Aria', gender: '여', desc: 'Bright · versatile' },
    { id: 'en-US-GuyNeural', label: 'Guy', gender: '남', desc: 'Warm · narration' },
  ],
  zh: [
    { id: 'zh-CN-XiaoxiaoNeural', label: '샤오샤오', gender: '여', desc: '표준어 · 따뜻함' },
    { id: 'zh-CN-YunxiNeural', label: '윈시', gender: '남', desc: '표준어 · 밝음' },
  ],
}

const MAX = 2000

export default function Tts() {
  const [lang, setLang] = useState<Lang>('ko')
  const [voiceId, setVoiceId] = useState(VOICES.ko[0].id)
  const [text, setText] = useState('안녕하세요. 투두TV 랩입니다. 오늘도 즐거운 쇼츠 만드세요!')
  const [rate, setRate] = useState(0) // %
  const [pitch, setPitch] = useState(0) // Hz
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const voices = VOICES[lang]

  const selectLang = (l: Lang) => {
    setLang(l)
    setVoiceId(VOICES[l][0].id)
  }

  const generate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: voiceId,
          text: text.slice(0, MAX),
          rate: `${rate >= 0 ? '+' : ''}${rate}%`,
          pitch: `${pitch >= 0 ? '+' : ''}${pitch}Hz`,
        }),
      })
      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status}). 로컬(npm run dev)에서는 /api 함수가 없어 동작하지 않아요. Cloudflare Pages 배포 후 사용하세요.`)
      }
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  const count = useMemo(() => text.length, [text])

  return (
    <PageShell
      badge="AI 음성 · 무료"
      title="AI 성우 (TTS)"
      desc="대본을 넣고 성우를 고르면 음성으로 만들어 드려요. 만들어진 소리는 바로 듣고 mp3로 내려받을 수 있어요."
    >
      {/* 1. 언어 */}
      <Card>
        <StepTitle step={1}>언어 선택</StepTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => selectLang(l.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                lang === l.id
                  ? 'border-amber-300/70 bg-amber-300/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <span className="mr-2 text-xs font-bold text-slate-400">{l.code}</span>
              <span className="font-semibold text-white">{l.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 2. 성우 */}
      <Card>
        <StepTitle step={2}>성우 선택</StepTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {voices.map((v) => (
            <button
              key={v.id}
              onClick={() => setVoiceId(v.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                voiceId === v.id
                  ? 'border-amber-300/70 bg-amber-300/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  v.gender === '여'
                    ? 'bg-pink-300/20 text-pink-200'
                    : 'bg-cyan-300/20 text-cyan-200'
                }`}
              >
                {v.gender}
              </span>
              <span>
                <span className="block font-semibold text-white">{v.label}</span>
                <span className="block text-xs text-slate-400">{v.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* 3. 대본 */}
      <Card>
        <StepTitle
          step={3}
          right={
            <span className="text-xs text-slate-400">
              {count} / {MAX}자
            </span>
          }
        >
          대본 입력
        </StepTitle>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          rows={6}
          className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.02] p-4 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-300/50"
          placeholder="읽어줄 문장을 입력하세요"
        />
      </Card>

      {/* 4. 속도/톤 */}
      <Card>
        <StepTitle step={4}>속도 · 톤</StepTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 flex justify-between text-xs text-slate-400">
              <span>속도</span>
              <span>{rate >= 0 ? '+' : ''}{rate}%</span>
            </span>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-amber-300"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex justify-between text-xs text-slate-400">
              <span>톤 (높낮이)</span>
              <span>{pitch >= 0 ? '+' : ''}{pitch}Hz</span>
            </span>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-amber-300"
            />
          </label>
        </div>
      </Card>

      {/* 생성 */}
      <button
        onClick={generate}
        disabled={loading || !text.trim()}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-200 py-4 text-base font-black text-[#0d1530] shadow-lg shadow-amber-300/20 transition hover:from-yellow-200 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '만드는 중…' : '🎙️ 음성 생성하기'}
      </button>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {audioUrl && (
        <Card>
          <div className="mb-3 text-sm font-bold text-slate-300">결과</div>
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download="shorts-lab-tts.mp3"
            className="mt-4 inline-flex rounded-xl border border-white/15 bg-white/[0.03] px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            ⬇ mp3 다운로드
          </a>
        </Card>
      )}
    </PageShell>
  )
}
