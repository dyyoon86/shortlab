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
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white lg:hidden"
        >
          ← 홈으로
        </Link>

        {/* 글래스 히어로 배너 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-100 ring-1 ring-white/20 backdrop-blur">
            {badge}
          </span>
          <h1 className="relative mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="relative mt-3 leading-relaxed text-white/70">{desc}</p>
        </div>

        <div className="mt-6 space-y-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

/** 반투명 유리 카드 (글래스모피즘) */
export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
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
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/30">
          {step}
        </span>
        <span className="text-sm font-semibold text-white">{children}</span>
      </div>
      {right}
    </div>
  )
}
