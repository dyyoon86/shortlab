import { ReactNode } from 'react'

/**
 * 전체 페이지 공통 레이아웃.
 * - 다크 네이비 대각선 그라데이션 배경(천천히 흐름)
 * - 화면 모서리에 큰 원형 블러(glow orb) 2개
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 bg-animated animate-gradient-shift">
      {/* 배경 글로우 blob — 헥토아카데미 블루 글래스 톤 */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-800/10 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
