import { ReactNode } from 'react'

/**
 * 전체 페이지 공통 레이아웃.
 * - 다크 네이비 대각선 그라데이션 배경(천천히 흐름)
 * - 화면 모서리에 큰 원형 블러(glow orb) 2개
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-[#04081a] via-[#0d1530] to-[#04081a] bg-animated animate-gradient-shift">
      {/* 배경 장식 orb */}
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
