import PageShell from '../components/PageShell'

type Book = {
  id: string
  series: string
  vol: string
  hook: string
  titlePre: string[]
  titleAccent: string
  accentClass: string
  gradient: string
  caption: string[]
  brand: string
  hasVideo: boolean
  cardTitle: string
  bullets: string[]
  status: 'ready' | 'soon'
  href?: string
}

const BOOKS: Book[] = [
  {
    id: 'antigravity-deploy',
    series: 'SHORTS DEPLOY GUIDE · VOL.01',
    vol: '01',
    hook: '코딩 0, 30분이면 충분합니다.',
    titlePre: ['코딩 몰라도', '웹사이트 만들어'],
    titleAccent: '배포까지.',
    accentClass: 'text-cyan-300',
    gradient: 'from-indigo-800 via-blue-900 to-slate-900',
    caption: ['안티그래비티·깃허브·버셀로', '가입부터 인터넷 공개까지'],
    brand: '투두TV 랩',
    hasVideo: true,
    cardTitle: '코딩 몰라도 웹사이트 만들기',
    bullets: ['가입 → 프롬프트 → 배포까지 한 권', '안티그래비티·깃허브·버셀 전부 무료'],
    status: 'ready',
    href: '/ebooks/antigravity-deploy-guide.html',
  },
  {
    id: 'ai-voice',
    series: 'SHORTS VOICE GUIDE · VOL.02',
    vol: '02',
    hook: '성우 섭외? 이제 필요 없어요.',
    titlePre: ['글자를 넣으면', 'AI 목소리로'],
    titleAccent: '읽어준다.',
    accentClass: 'text-emerald-300',
    gradient: 'from-emerald-700 via-teal-800 to-slate-900',
    caption: ['edge-tts 서버리스 함수로', '말하는 웹사이트 만들기'],
    brand: '투두TV 랩',
    hasVideo: false,
    cardTitle: 'AI 성우 기능 넣기',
    bullets: ['텍스트 → 자연스러운 AI 목소리', '한·일·영·중 성우 골라 쓰기'],
    status: 'soon',
  },
  {
    id: 'subtitle',
    series: 'SHORTS SUBTITLE GUIDE · VOL.03',
    vol: '03',
    hook: '받아쓰기, 컴퓨터가 대신.',
    titlePre: ['영상 올리면', '한글 자막이'],
    titleAccent: '자동으로.',
    accentClass: 'text-amber-300',
    gradient: 'from-amber-700 via-orange-900 to-stone-900',
    caption: ['브라우저 안 Whisper로', '서버 없이 자막 추출'],
    brand: '투두TV 랩',
    hasVideo: false,
    cardTitle: '영상 자막 추출 넣기',
    bullets: ['영상 → SRT 자막 자동 생성', '서버 없이 브라우저에서 처리'],
    status: 'soon',
  },
  {
    id: 'silence',
    series: 'SHORTS SILENCE GUIDE · VOL.04',
    vol: '04',
    hook: '지루한 정적, 자동으로 컷.',
    titlePre: ['조용한 구간은', '알아서'],
    titleAccent: '싹둑.',
    accentClass: 'text-sky-300',
    gradient: 'from-slate-700 via-slate-900 to-black',
    caption: ['Web Audio 신호처리로', 'AI 없이 가볍게'],
    brand: '투두TV 랩',
    hasVideo: false,
    cardTitle: '무음 제거 넣기',
    bullets: ['조용한 부분 자동 감지·삭제', 'AI 없이 가볍게 동작'],
    status: 'soon',
  },
]

export default function Ebooks() {
  return (
    <PageShell
      wide
      badge="전자책 서재"
      title="쇼츠 도구 만들기 가이드북"
      desc="쇼츠 도구를 직접 만들고 배포하는 과정을, 코딩 몰라도 따라 할 수 있게 한 권씩 정리했어요. VOL.01부터 시작해요."
    >
      {/* 시리즈 구분선 */}
      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-300" />
        <span className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-pink-500" />
          NEW · 쇼츠 도구 만들기 시리즈
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-pink-300" />
      </div>

      {/* 책 그리드 */}
      <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {BOOKS.map((b) => (
          <div key={b.id}>
            {/* 책 표지 */}
            <div
              className={`relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg`}
            >
              {/* 배경 대형 번호 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-8 right-1 select-none text-[170px] font-black leading-none text-white/[0.06]"
              >
                {b.vol}
              </span>

              {/* 상단: 시리즈 라벨 + 뱃지 */}
              <div className="relative flex items-start justify-between">
                <span className="max-w-[70%] text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
                  {b.series}
                </span>
                {b.status === 'ready' ? (
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-gray-900">
                    FREE
                  </span>
                ) : (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/80">
                    준비중
                  </span>
                )}
              </div>

              {/* 훅 + 제목 */}
              <p className="relative mt-3 text-[11px] text-white/70">{b.hook}</p>
              <h3 className="relative mt-1.5 text-[28px] font-extrabold leading-tight">
                {b.titlePre.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className={`block ${b.accentClass}`}>{b.titleAccent}</span>
              </h3>

              {/* 하단: 캡션 + 영상/브랜드 */}
              <div className="relative mt-auto flex items-end justify-between gap-2">
                <div className="text-[10px] leading-relaxed text-white/50">
                  {b.caption.map((c) => (
                    <span key={c} className="block">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="shrink-0 text-right">
                  {b.hasVideo && (
                    <span className="block text-[10px] font-semibold text-white/70">
                      ▶ 원본 영상 보기
                    </span>
                  )}
                  <span className="block text-[10px] text-white/40">{b.brand}</span>
                </div>
              </div>
            </div>

            {/* 표지 아래: 제목 + 불릿 + 버튼 */}
            <h4 className="mt-5 text-lg font-bold text-gray-900">{b.cardTitle}</h4>
            <ul className="mt-2.5 space-y-1.5">
              {b.bullets.map((t) => (
                <li
                  key={t}
                  className="flex gap-2 text-sm leading-relaxed text-gray-500"
                >
                  <span className="text-amber-500">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            {b.status === 'ready' ? (
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-3.5 text-base font-bold text-gray-900 shadow-sm transition hover:brightness-105"
              >
                🎁 무료로 읽기 →
              </a>
            ) : (
              <div className="mt-5 flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-3.5 text-base font-bold text-gray-400">
                곧 공개돼요
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  )
}
