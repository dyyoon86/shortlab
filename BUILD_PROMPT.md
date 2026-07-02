# 실행 지시서 — 안티그래비티에 이 파일 그대로 붙여넣기

이 문서는 스펙 문서(PROJECT.md)가 아니라 **AI 코딩 에이전트가 순서대로 실행할 작업 목록**입니다. 위에서 아래로 하나씩 그대로 실행하세요. 각 단계가 끝나면 다음 단계로 넘어가세요. 애매한 부분은 아래 "결정된 사항"을 그대로 따르고, 다시 물어보지 마세요.

---

## 0. 결정된 사항 (그대로 따를 것, 재확인 불필요)

- 프로젝트 이름: `shorts-lab`
- 프레임워크: Vite + React + TypeScript + Tailwind CSS
- 배포 방식: 대부분 정적 사이트 + Vercel 서버리스 함수 1개 (AI 성우 기능만, Node.js 런타임)
- 디자인: 아래 "디자인 토큰" 그대로 사용
- 기능 3개: AI 성우(TTS) / 영상 자막 추출(한국어) / 무음 제거
- 번역 기능은 없음. 일본어 관련 처리도 없음.

## 디자인 토큰 (그대로 사용)

- 배경: `bg-gradient-to-br from-[#04081a] via-[#0d1530] to-[#04081a]` + 천천히 움직이는 그라데이션 애니메이션
- 배경 장식: 우상단 `bg-cyan-400/25 blur-3xl rounded-full`, 좌하단 `bg-amber-300/20 blur-3xl rounded-full` (큰 원형 블러 2개)
- 폰트: Pretendard Variable (CDN 또는 npm 패키지로 설치, 폴백은 시스템 산세리프)
- 타이틀 강조: `bg-gradient-to-r from-cyan-300 via-amber-200 to-pink-300 bg-clip-text text-transparent` + 반짝이는 애니메이션
- 메인 버튼: `bg-gradient-to-r from-amber-300 to-yellow-200 hover:from-yellow-200 hover:to-amber-300 text-[#0d1530] font-black rounded-2xl px-8 py-4`
- 카드: `bg-white/[0.03] border border-white/10 rounded-[17px]` (반투명 유리 느낌)
- 뱃지/필: `rounded-full bg-cyan-300/10`
- 로고/마스코트는 레퍼런스(캥거루)를 베끼지 말고 새로 만들 것 (간단한 텍스트 로고나 기하학적 아이콘으로 대체)

---

## STEP 1 — 프로젝트 뼈대 생성

1. `npm create vite@latest shorts-lab -- --template react-ts` 로 프로젝트 생성
2. Tailwind CSS 설치 및 설정 (`tailwindcss`, `postcss`, `autoprefixer`)
3. Pretendard 폰트 적용
4. 라우팅 설치 (`react-router-dom`)
5. 페이지 구조 생성:
   - `/` — 랜딩 페이지 (타이틀 + 기능 카드 3개 + CTA 버튼)
   - `/tts` — AI 성우 페이지
   - `/subtitle` — 영상 자막 추출 페이지
   - `/silence` — 무음 제거 페이지
6. 위 "디자인 토큰"을 랜딩 페이지에 그대로 적용해서 다크 테마 완성

## STEP 2 — AI 성우 (TTS) 기능 구현

1. `functions/api/tts.ts` 파일 생성 (Cloudflare Pages Functions 규칙에 맞게)
2. 이 함수는 edge-tts 프로토콜로 마이크로소프트의 읽어주기 서버(`speech.platform.bing.com`)에 웹소켓으로 접속해서 텍스트를 음성으로 변환하고, mp3 스트림을 응답으로 돌려줌. (참고: `edge-tts` npm 패키지가 있으면 그 로직을 그대로 이식하거나, 없으면 프로토콜을 직접 구현)
3. 요청 파라미터: 언어(ko/ja/en/zh), 보이스 이름, 텍스트, 속도(rate), 톤(pitch)
4. `/tts` 페이지 UI 구성:
   - 언어 선택 탭 4개 (한/일/영/중)
   - 성우 선택 카드 (언어별로 edge-tts가 제공하는 실제 보이스 중 2~3개를 성별/톤 설명과 함께 프리셋으로 노출)
   - 대본 입력창 (글자수 제한 표시, 2000자)
   - 속도/톤 슬라이더
   - "음성 생성하기" 버튼 → `/api/tts` 호출 → 결과 오디오 재생 + mp3 다운로드 버튼

## STEP 3 — 영상 자막 추출 기능 구현 (완전 클라이언트 사이드, 서버 없음)

1. `@xenova/transformers` (transformers.js) 설치
2. `/subtitle` 페이지: 영상 파일 업로드 (input type=file, 서버 업로드 없이 브라우저 안에서만 처리)
3. 업로드된 영상에서 오디오 트랙 추출
4. Whisper(whisper-small, task=transcribe, language=ko) 모델을 브라우저에서 로드해서 오디오 → 한국어 텍스트 + 타임스탬프로 변환
5. 결과를 SRT 파일로 만들어 다운로드 버튼 제공
6. 처리 중 진행률(모델 다운로드 %, 변환 진행 %) 화면에 표시

## STEP 4 — 무음 제거 기능 구현 (완전 클라이언트 사이드, AI 모델 없음)

1. `/silence` 페이지: 영상/오디오 파일 업로드
2. Web Audio API로 오디오 디코딩 → 진폭(RMS) 분석 → 임계값 이하 구간을 무음으로 판단
3. 무음 구간을 잘라낸 결과물을 다운로드 가능하게 처리
4. 임계값(민감도) 조절 슬라이더 제공

## STEP 5 — 로컬 확인

1. `npm run dev` 로 로컬 서버 실행
2. 랜딩 페이지 → 3개 기능 페이지 이동이 정상 동작하는지 확인
3. 빌드 확인: `npm run build` 에러 없이 통과하는지 확인

## STEP 6 — Git 저장 및 GitHub 업로드

1. `git init`
2. `.gitignore`에 `node_modules`, `dist` 추가
3. 전체 파일 add & 첫 커밋
4. GitHub CLI(`gh`)가 설치·로그인 되어 있으면: `gh repo create shorts-lab --public --source=. --remote=origin --push` 실행
5. `gh`가 없거나 로그인이 안 되어 있으면, 사용자에게 다음을 알려줄 것: "GitHub 웹사이트에서 새 저장소(shorts-lab)를 만들고, 아래 명령어로 연결해서 push 하세요" + 정확한 `git remote add`/`git push` 명령어 제시

## STEP 7 — Cloudflare Pages 연결 (⚠️ 이 단계는 사람이 직접 해야 함, AI가 대신 못 함)

이 단계는 브라우저에서 Cloudflare 계정 로그인이 필요해서 에이전트가 자동으로 못 합니다. 여기까지 오면 에이전트는 사용자에게 아래를 그대로 안내만 하고 작업을 마칩니다:

1. https://dash.cloudflare.com 접속 → 로그인
2. 왼쪽 메뉴 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 방금 만든 `shorts-lab` GitHub 저장소 선택
4. 빌드 설정:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Save and Deploy** 클릭
6. 몇 분 뒤 발급되는 `*.pages.dev` 주소로 실제 사이트 접속 확인

이후로는 GitHub `main` 브랜치에 push할 때마다 Cloudflare Pages가 자동으로 재배포합니다.

---

## 완료 기준 (에이전트 스스로 체크할 것)

- [ ] 랜딩 페이지 디자인이 디자인 토큰과 일치
- [ ] `/tts`, `/subtitle`, `/silence` 3개 페이지 전부 동작
- [ ] `npm run build` 에러 없음
- [ ] GitHub에 push 완료
- [ ] 사용자에게 STEP 7(클라우드플레어 수동 연결) 안내문 전달함
