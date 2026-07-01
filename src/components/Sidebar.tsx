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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl">
          🎬
        </span>
        <span>
          <span className="block font-black text-white">투두TV 랩</span>
          <span className="block text-xs text-slate-400">무료 · 로그인 없음</span>
        </span>
      </Link>

      {/* 메뉴 */}
      <nav className="flex flex-col gap-2">
        <div className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                  ? 'border-amber-300/60 bg-amber-300/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">
                  {m.title}
                </span>
                <span className="block truncate text-xs text-slate-400">{m.desc}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 하단 홈 링크 */}
      <div className="mt-auto hidden lg:block">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-slate-300 transition hover:bg-white/[0.05]"
        >
          ← 홈으로
        </Link>
      </div>
    </aside>
  )
}
