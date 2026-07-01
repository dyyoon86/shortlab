import { ReactNode } from 'react'

/**
 * 전체 페이지 공통 레이아웃 — 헥토아카데미 라이트 대시보드 톤.
 * 연회색(gray-50) 배경 위에 흰 카드가 얹히는 밝고 깔끔한 SaaS 스타일.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 text-gray-900">
      {children}
    </div>
  )
}
