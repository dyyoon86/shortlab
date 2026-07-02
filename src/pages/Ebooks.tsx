import PageShell from '../components/PageShell'

type Book = {
  id: string
  title: string
  desc: string
  emoji: string
  cover: string
  tags: string[]
  meta: string
  href: string
  badge?: string
}

const BOOKS: Book[] = [
  {
    id: 'antigravity-deploy',
    title: '코딩 몰라도 웹사이트 만들기',
    desc: '가입부터 인터넷 배포까지 — 안티그래비티·깃허브·버셀로 30분 만에 내 웹사이트를 세상에 공개하는 실습 가이드.',
    emoji: '🪄',
    cover: 'from-blue-500 to-blue-700',
    tags: ['입문', '노코딩', '무료'],
    meta: '약 30분 · 9장',
    href: '/ebooks/antigravity-deploy-guide.html',
    badge: 'NEW',
  },
]

export default function Ebooks() {
  return (
    <PageShell
      badge="전자책 서재"
      title="따라 하면 되는 실습 전자책"
      desc="쇼츠 도구를 직접 만들고 배포하는 과정을, 코딩 몰라도 따라 할 수 있게 정리했어요. 계속 한 권씩 늘려갑니다."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {BOOKS.map((book) => (
          <div
            key={book.id}
            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
          >
            <div
              className={`relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${book.cover}`}
            >
              <span className="text-5xl">{book.emoji}</span>
              {book.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  {book.badge}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="font-bold text-white">{book.title}</span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm leading-relaxed text-gray-500">{book.desc}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">{book.meta}</span>
                <a
                  href={book.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  읽기 →
                </a>
              </div>

              <p className="mt-2 text-[11px] text-gray-400">
                브라우저에서 인쇄(Ctrl/⌘+P) → PDF로 저장
              </p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
