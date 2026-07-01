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

      <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:mx-0 lg:px-10">
        {/* 모바일에서만 보이는 홈 링크 */}
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white lg:hidden"
        >
          ← 홈으로
        </Link>

        {/* 컬러 히어로 배너 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/10 to-amber-400/15 p-6">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-2xl" />
          <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-cyan-100 ring-1 ring-white/15">
            {badge}
          </span>
          <h1 className="relative mt-4 text-3xl font-black text-white sm:text-4xl">
            {title}
          </h1>
          <p className="relative mt-3 leading-relaxed text-slate-200/90">{desc}</p>
        </div>

        <div className="mt-6 space-y-6">{children}</div>
      </main>
    </div>
  )
}

/** 반투명 유리 카드 */
export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[17px] border border-white/10 bg-white/[0.04] p-6">
      {children}
    </section>
  )
}

const STEP_COLORS = [
  'from-cyan-300 to-sky-400',
  'from-fuchsia-300 to-pink-400',
  'from-amber-300 to-yellow-400',
  'from-emerald-300 to-teal-400',
]

/** 컬러 번호칩이 붙은 섹션 제목 */
export function StepTitle({
  step,
  children,
  right,
}: {
  step: number
  children: ReactNode
  right?: ReactNode
}) {
  const grad = STEP_COLORS[(step - 1) % STEP_COLORS.length]
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${grad} text-xs font-black text-[#0d1530]`}
        >
          {step}
        </span>
        <span className="text-sm font-bold text-slate-100">{children}</span>
      </div>
      {right}
    </div>
  )
}
