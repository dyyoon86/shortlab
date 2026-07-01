import { Link, useLocation } from 'react-router-dom'

const MENU = [
  { to: '/tts', emoji: '🎙️', title: 'AI 성우', desc: '한·일·영·중 내레이션' },
  { to: '/subtitle', emoji: '📝', title: '영상 자막 추출', desc: '한국어 자막(SRT)' },
  { to: '/silence', emoji: '✂️', title: '무음 제거', desc: '조용한 구간 자동 컷' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-gray-100 bg-white lg:h-[100dvh] lg:w-72 lg:overflow-y-auto lg:border-r lg:px-5 lg:py-7">
      {/* 로고 */}
      <Link to="/" className="flex items-center gap-3 px-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-sm">
          🎬
        </span>
        <span>
          <span className="block font-bold text-gray-900">투두TV 랩</span>
          <span className="block text-xs text-gray-400">무료 · 로그인 없음</span>
        </span>
      </Link>

      {/* 메뉴 */}
      <nav className="flex flex-col gap-1.5">
        <div className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                  ? 'border-blue-100 bg-blue-50'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-sm font-bold ${
                    active ? 'text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {m.title}
                </span>
                <span className="block truncate text-xs text-gray-400">{m.desc}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 하단 홈 링크 */}
      <div className="mt-auto hidden lg:block">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-gray-100 px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-50"
        >
          ← 홈으로
        </Link>
      </div>
    </aside>
  )
}
