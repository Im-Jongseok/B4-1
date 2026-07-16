# 디자인 가이드

포트폴리오 웹사이트의 디자인 기준. 모든 값은 `css/style.css`의 CSS 변수로 정의되어 있으며, 이 문서와 코드가 항상 일치해야 한다.

![디자인 시스템 한눈에 보기](docs/design-system.svg)

## 1. 디자인 원칙

- **심플**: 장식보다 가독성. 아이콘 라이브러리 없이 유니코드/이모지 아이콘만 사용한다.
- **템플릿 우선**: 콘텐츠(이름, 소개, 링크)는 `[플레이스홀더]`로 비워두고 구조만 잡는다.
- **변수 기반**: 색·폰트·간격은 반드시 CSS 변수를 거친다. 하드코딩 금지.
- **파일 분리**: 브라우저 초기화는 `css/reset.css`, 디자인 결정은 `css/style.css`. 로드 순서는 reset → style.
- **모바일 퍼스트**: 기본 스타일은 모바일 기준, 미디어 쿼리로 확장한다.

## 2. 컬러

### 라이트 테마 (기본, `:root`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-bg` | `#ffffff` | 페이지 배경 |
| `--color-surface` | `#f1f5f9` | 카드·입력 필드 등 면 배경 |
| `--color-text` | `#1e293b` | 본문 텍스트 |
| `--color-text-muted` | `#64748b` | 보조 텍스트 (부제, 설명) |
| `--color-primary` | `#0f4c81` | 포인트 (버튼, 링크 강조) — 청사진(Prussian blue) 계열 |
| `--color-primary-contrast` | `#ffffff` | 포인트 색 위의 텍스트 |
| `--color-border` | `#e2e8f0` | 경계선 |
| `--color-error` | `#991b1b` | 폼 에러 메시지 — 차분한 어두운 톤 |
| `--color-success` | `#166534` | 폼 성공 메시지 — 차분한 어두운 톤 |

### 다크 테마 (`[data-theme="dark"]`)

| 토큰 | 값 |
|------|-----|
| `--color-bg` | `#0f172a` |
| `--color-surface` | `#1e293b` |
| `--color-text` | `#e2e8f0` |
| `--color-text-muted` | `#94a3b8` |
| `--color-primary` | `#4a7fb0` |
| `--color-border` | `#334155` |
| `--color-error` | `#b06060` |
| `--color-success` | `#55876b` |

에러·성공은 라이트에서 어두운 톤, 다크 배경에서는 가독성을 위해 채도 낮춘 밝은 변형을 쓴다.

## 3. 타이포그래피

- 폰트: **Hack** (모노스페이스, jsdelivr CDN) — 영문·숫자 담당. 한글 글리프가 없어 한글은 Pretendard Variable로 폴백 (둘 다 로드)
- **굵기 통일**: 모든 요소 `font-weight: 400` 고정 (`* { font-weight: 400 }`). 크기·색으로만 위계를 표현한다.
- 본문 행간: `1.6`

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--font-size-sm` | `0.875rem` | 보조 정보 (카드 메타, 에러 메시지, 푸터) |
| `--font-size-base` | `1rem` | 본문 (인사말 포함 — Hero도 일반 텍스트 크기) |
| `--font-size-lg` | `1.25rem` | 섹션 제목 (`.section-title`) |
| `--font-size-xl` | `1.5rem` | 대형 강조 (예비) |

## 4. 간격

4px 배수 대신 rem 기반 5단계 스케일을 사용한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--space-xs` | `0.25rem` | 라벨-인풋 사이 등 최소 간격 |
| `--space-sm` | `0.5rem` | 버튼 패딩(세로), 인라인 요소 간격 |
| `--space-md` | `1rem` | 카드 패딩, 폼 필드 간격 |
| `--space-lg` | `2rem` | 섹션 제목 아래, 컴포넌트 블록 간격 |
| `--space-xl` | `4rem` | 섹션 사이 세로 간격 |

## 5. 형태·효과

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius` | `0` | 라운드 미사용 — 모든 모서리 각지게 |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.08)` | 카드 기본 그림자 (다크: 0.4) |
| `--transition` | `0.2s ease` | hover 등 상태 전환 (스크롤 리빌 애니메이션은 1차 범위 제외) |

## 6. 컴포넌트

- **버튼 `.btn`**: 컬러 없이 테두리(`--color-border`)만. 패딩 `sm lg`, radius, transition. hover 시 surface 배경 + 테두리 진해짐. 단일 종 (primary 색은 버튼에 쓰지 않음).
- **카드 `.card`**: surface 배경 + border + shadow + radius, 패딩 `md`. hover 시 그림자 강조. Projects 저장소 카드에 사용.
- **섹션 제목 `.section-title`**: 코드 주석 스타일 라벨 — `sm` 크기, muted 색, `::before`로 `// ` 접두어, 자간 0.08em. 태그는 `<h3>` 유지 (시맨틱·접근성).
- **폼 `.form`**: 필드 세로 배치, 라벨 위·인풋 아래. 에러는 `--color-error`로 필드 바로 아래, 성공 메시지는 `--color-success`.
- **기술 스택 = 프로젝트 필터 (중복 선택)**: Skills 항목은 `.skills__filter` 토글 버튼 — 여러 개를 동시에 선택할 수 있고, 선택된 언어 중 하나라도 해당하는 프로젝트를 표시 (`array.filter()`). 아무것도 선택 안 하면 전체 표시. JS가 GitHub 저장소 언어 목록으로 동적 생성하며, 선택된 필터는 primary 색 테두리·글자로 표시. `[badge: ...]` 자리는 뱃지/아이콘으로 교체 가능.
- **아이콘**: `[icon: moon]`, `[icon: menu]`, `[icon: arrow-up]`, `[icon: github]`, `[icon: mail]` 자리에 유니코드/이모지 문자만 사용. 라이브러리 금지.
- **Contact**: 텍스트 링크 대신 아이콘 가로 나열 — `[icon: github]`는 GitHub 프로필 링크, `[icon: mail]`은 문의 폼 토글 버튼. hover 시 primary 색.

## 7. 레이아웃 & 브레이크포인트

- 모바일 퍼스트. 최소 지원 폭 `320px` (body min-width), 콘텐츠 최대 폭 제한 없음 — 화면 전체 폭 사용
- 헤더는 `position: sticky`로 상단 고정. 앵커 이동 시 가려짐 방지로 `scroll-padding-top: 4.5rem`
- 태블릿: `@media (min-width: 768px)`
- 데스크톱: `@media (min-width: 1024px)`
- 헤더: Flexbox (로고 왼쪽, 액션 버튼 오른쪽). 네비 메뉴는 전 화면 공통으로 기본 숨김 — 햄버거 토글 시 오른쪽 드롭다운 패널로 표시
- 데스크톱(1024px~) 섹션 배치: `main`에 Grid `grid-template-areas` 적용 (컬럼 2fr : 1fr) — 첫 화면은 hero 왼쪽 대형(2행 스팬, `100vh - 헤더` 채움, 중앙 정렬) + 오른쪽 위 자기소개·아래 연락. 그 아래 Skills는 제목+필터 버튼 한 줄짜리 컴팩트 바(전체 폭), Projects는 전체 폭으로 카드 그리드 여유 확보. HTML 순서는 시맨틱하게 유지하고 시각 배치만 변경. 모바일·태블릿은 세로 스택
- Projects 그리드: `repeat(auto-fit, minmax(280px, 1fr))`

## 8. 동작 기준값 (JS)

| 항목 | 값 |
|------|-----|
| 스크롤 탑 버튼 노출 | 스크롤 시작 시 (스크롤 위치 > 0), 하단 중앙 고정 |
| 네비 배경 변경 | 스크롤 60px 이상 |
| Contact 문의 폼 | 기본 숨김 — `[icon: mail]` 버튼 클릭 시 표시 토글 |
| 스크롤 리빌 애니메이션 | 1차 제외 (추후 IntersectionObserver threshold 0.2) |
