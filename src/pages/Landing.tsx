import { Link } from 'react-router-dom'

const FEATURES = [
  {
    to: '/tts',
    emoji: '🎙️',
    title: 'AI 성우',
    desc: '대본을 넣으면 자연스러운 목소리로 읽어줘요. 한·일·영·중 지원.',
  },
  {
    to: '/subtitle',
    emoji: '📝',
    title: '영상 자막 추출',
    desc: '영상을 올리면 그 안의 한국어 말소리를 자막(SRT)으로 뽑아줘요.',
  },
  {
    to: '/silence',
    emoji: '✂️',
    title: '무음 제거',
    desc: '영상·오디오에서 조용한 구간을 자동으로 찾아 잘라줘요.',
  },
]

export default function Landing() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-14">
      {/* 로고 */}
      <div className="animate-float-slow mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-5xl shadow-2xl">
        🎬
      </div>

      {/* 뱃지 */}
      <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-4 py-1 text-sm font-semibold text-cyan-200">
        무료 · 로그인 없음
      </span>

      {/* 타이틀 */}
      <h1 className="text-center text-4xl font-black leading-tight sm:text-6xl">
        <span className="text-white">쇼츠를 만드는</span>
        <br />
        <span className="animate-shimmer-text bg-gradient-to-r from-cyan-300 via-amber-200 to-pink-300 bg-clip-text text-transparent">
          모든 도구
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-center text-base leading-relaxed text-slate-300 sm:text-lg">
        쇼츠 만들 때 필요한 도구들을 무료로 모아뒀어요. 필요한 기능은 계속 하나씩
        추가됩니다.
      </p>

      {/* 기능 카드 */}
      <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group rounded-[17px] border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="mb-3 text-4xl">{f.emoji}</div>
            <div className="mb-2 text-lg font-bold text-white">{f.title}</div>
            <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/tts"
        className="mt-12 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-200 px-10 py-5 text-[15px] font-black text-[#0d1530] shadow-lg shadow-amber-300/20 transition hover:from-yellow-200 hover:to-amber-300 sm:text-base"
      >
        시작하기 →
      </Link>

      <footer className="mt-16 text-xs text-slate-500">
        © SHORTS-LAB
      </footer>
    </main>
  )
}
