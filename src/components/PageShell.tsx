import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'

/** 기능 페이지 공통 골격: 좌측 사이드바 + 우측 본문(제목/설명/내용) */
export default function PageShell({
  badge,
  title,
  desc,
  children,
}: {
  badge: string
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 px-6 py-10 lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-4xl">
          {/* 모바일에서만 보이는 홈 링크 */}
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900 lg:hidden"
          >
            ← 홈으로
          </Link>

          {/* 히어로 — 소프트 블루 강조 카드 */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
              {badge}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 leading-relaxed text-gray-600">{desc}</p>
          </div>

          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

/** 흰 카드 (라이트 대시보드) */
export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {children}
    </section>
  )
}

/** 블루 번호칩이 붙은 섹션 제목 */
export function StepTitle({
  step,
  children,
  right,
}: {
  step: number
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          {step}
        </span>
        <span className="text-sm font-semibold text-gray-900">{children}</span>
      </div>
      {right}
    </div>
  )
}
