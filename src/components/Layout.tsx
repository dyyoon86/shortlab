import { ReactNode } from 'react'

/**
 * 전체 페이지 공통 레이아웃.
 * - 다크 네이비 대각선 그라데이션 배경(천천히 흐름)
 * - 화면 모서리에 큰 원형 블러(glow orb) 2개
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-[#050914] via-[#0b1228] to-[#060a1a] bg-animated animate-gradient-shift">
      {/* 배경 장식 orb — 오로라 톤 (시안·바이올렛·핑크) */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[120px]" />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
