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
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-4xl shadow-sm">
        🎬
      </div>

      {/* 뱃지 */}
      <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-bold text-blue-700">
        무료 · 로그인 없음
      </span>

      {/* 타이틀 */}
      <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 sm:text-6xl">
        쇼츠를 만드는
        <br />
        <span className="text-blue-600">모든 도구</span>
      </h1>

      <p className="mt-6 max-w-xl text-center text-base leading-relaxed text-gray-500 sm:text-lg">
        쇼츠 만들 때 필요한 도구들을 무료로 모아뒀어요. 필요한 기능은 계속 하나씩
        추가됩니다.
      </p>

      {/* 기능 카드 */}
      <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 text-4xl">{f.emoji}</div>
            <div className="mb-2 text-lg font-bold text-gray-900 group-hover:text-blue-700">
              {f.title}
            </div>
            <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/tts"
        className="mt-12 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-500"
      >
        시작하기 →
      </Link>

      <footer className="mt-16 text-xs text-gray-400">© 투두TV 랩</footer>
    </main>
  )
}
