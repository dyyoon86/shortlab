import { Link, useLocation } from 'react-router-dom'

const MENU = [
  { to: '/tts', emoji: '🎙️', title: 'AI 성우', desc: '한·일·영·중 내레이션' },
  { to: '/subtitle', emoji: '📝', title: '영상 자막 추출', desc: '한국어 자막(SRT)' },
  { to: '/silence', emoji: '✂️', title: '무음 제거', desc: '조용한 구간 자동 컷' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-white/10 lg:h-[100dvh] lg:w-72 lg:overflow-y-auto lg:border-r lg:px-5 lg:py-7">
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-3 px-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-2xl shadow-lg shadow-blue-500/30">
          🎬
        </span>
        <span>
          <span className="block font-bold text-white">투두TV 랩</span>
          <span className="block text-xs text-white/50">무료 · 로그인 없음</span>
        </span>
      </Link>

      {/* 메뉴 */}
      <nav className="flex flex-col gap-2">
        <div className="px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
          메뉴
        </div>
        {MENU.map((m) => {
          const active = pathname === m.to
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                active
                  ? 'border-blue-400/60 bg-blue-500/20 shadow-lg shadow-blue-500/10'
                  : 'border-white/20 bg-white/10 backdrop-blur-md hover:border-white/30 hover:bg-white/[0.15]'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {m.title}
                </span>
                <span className="block truncate text-xs text-white/50">{m.desc}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 하단 홈 링크 */}
      <div className="mt-auto hidden lg:block">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white/70 backdrop-blur-md transition hover:bg-white/[0.15]"
        >
          ← 홈으로
        </Link>
      </div>
    </aside>
  )
}
