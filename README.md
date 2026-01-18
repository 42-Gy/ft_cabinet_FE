# SUBAK – 42 경산 공유 사물함 프론트엔드

SUBAK은 "Safe Under Beside you, Always Keeping" 이라는 슬로건으로, 42 경산 카뎃들을 위한 공유 사물함 서비스의 프론트엔드 레포입니다.  
캠퍼스 곳곳에 배치된 사물함을 직관적으로 조회하고, 대여·반납하며, 수박 코인(재화)과 아이템을 관리할 수 있는 반응형 웹 서비스를 제공합니다.

---

## 핵심 기능

- **서비스 전면 개편** – 홈 Hero, 섹션 하이라이트, SUBAK Stories 카드, 수박 지도 등 수박 테마로 통일된 UI를 Chakra UI와 커스텀 테마로 구성했습니다.
- **실시간 사물함 플로우** – 지도(view='map') → 섹션 상세(view='detail') 2단계. 섹션을 선택하면 수박 아이콘으로 꾸며진 2줄 그리드가 Drawer와 연결되어 즉시 대여하거나 상세를 확인할 수 있습니다.
- **토큰 보안/재발급** – URL Fragment(`#token=`)에서 accessToken을 저장하고, `refresh_token`은 HttpOnly Cookie에 맡깁니다. Axios interceptor가 401 시 `/v4/auth/reissue`를 한 번만 시도한 뒤 원 요청을 재시도합니다.
- **사용자 정보 공유** – `AppProviders`가 `useMeQuery`를 선 실행하여 로그인 직후 새로고침 없이 헤더/사물함/스토어/출석에서 동일 데이터를 공유합니다.
- **스토어 & 아이템 사용** – 대여권은 구매 불가로 표시하며, 연장/이사/감면권은 개별 로딩 상태로 구매합니다. /my/lockers에서 “사용” 버튼으로 연장·교체·패널티 감면 API를 호출합니다.
- **출석 & 달력** – `/attendance`에서 출석 버튼과 달력을 제공해 `/v4/users/attendance` 응답을 하이라이트합니다. 성공 시 코인과 달력이 즉시 갱신됩니다.
- **레이어드 아키텍처** – pages → hooks → api/state → libs/utils/types 순으로 단방향을 강제하고, ESLint `no-restricted-imports` + Prettier import sort로 구조를 지킵니다.

---

## 기술 스택

- **Vite + React + TypeScript**
- **Chakra UI** (커스텀 ThemeProvider, 다크모드, 수박 팔레트)
- **React Router DOM**
- **TanStack Query v5** (queryClient, invalidate 전략 포함)
- **Axios** (인증/공개 client 분리, reissue 인터셉터)
- **ESLint Flat + Prettier + import sort**
- **Path alias** `@/*`

---

## 빠른 시작

```bash
npm install
cp .env.example .env   # 값 수정
npm run dev            # http://localhost:5173
```

> ⚠️ 백엔드가 지정한 Redirect URL(`http://localhost:5173`)과 동일한 Origin으로 접속해야 OAuth 리다이렉트가 성공합니다.

### 주요 스크립트

| Script            | 설명                        |
| ----------------- | --------------------------- |
| `npm run dev`     | Vite 개발 서버              |
| `npm run build`   | 타입 체크 + 프로덕션 번들   |
| `npm run preview` | 빌드 결과 미리보기          |
| `npm run lint`    | ESLint + Prettier 규칙 검증 |

---

## 환경 변수

`.env.example`을 복사해 아래 값을 채워 주세요.

| 변수                                             | 설명                                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| `VITE_SERVICE_NAME`                              | 헤더 로고와 Hero에 표시되는 서비스명 (기본 SUBAK)    |
| `VITE_API_BASE_URL`                              | 인증이 필요한 `/v4/*` API의 기본 URL                 |
| `VITE_AUTH_BASE_URL`                             | OAuth 리다이렉트 Origin (`/oauth2/authorization/42`) |
| `VITE_POLICY_EMAIL` / `VITE_POLICY_CONTACT`      | 정책 페이지에 노출될 연락처                          |
| `VITE_POLICY_UPDATED_AT` / `VITE_POLICY_SUMMARY` | 정책 정보                                            |
| `VITE_USE_MOCK`                                  | `false`여야 실제 API 계층 사용                       |

---

## 폴더 구조 & 의존성 규칙

```
src/
  app/                # App.tsx, providers, routes(page)
  components/         # atoms/molecules/organisms/templates
  features/
    auth/             # token provider, bootstrap hooks
    lockers/          # 사물함 API/hooks/components
    store/            # 스토어, 아이템 상수
    status/           # 홈/지도/현황 UI
    users/            # /v4/users/me 등 사용자 API
    attendance/       # 출석 페이지
  libs/               # axios/env/query 등 공용 infra
  styles/             # Chakra theme, 글로벌 스타일
  types/              # 공통 타입
  utils/              # date 포맷 등 순수 유틸
```

레이어 규칙 (ESLint로 강제):

1. **pages**(`src/app/routes`) → 도메인 **hooks**로만 접근 (api/recoil 직접 import 금지).
2. **hooks**는 api + state를 조합해 UI-friendly 데이터를 반환.
3. **api** 파일은 axios 래퍼만 사용하고 React/Recoil import 금지.
4. **state**(atom/selector)는 외부 API 호출 금지.
5. **components**는 hook이나 props만 통해 데이터 접근.
6. **utils/constants/types**는 순수 함수/데이터만 포함.

---

## 주요 화면 & 플로우

### 1. 홈 `/`

- Hero 영역: “무거운 짐은 이제 그만 수박에게” CTA + 수박 지도 배경.
- `UsageSummary`: `/v4/cabinets/status-summary/all` 응답으로 전체 사물함 통계를 공개 API로 표시.
- SUBAK Stories 카드 3종(사물함 대여법/수박 얻는 법/상점 안내서)이 모달과 연결.
- Section highlight / carousel / 수박 테마 컴포넌트가 다크모드 대응.

### 2. 사물함 `/lockers`

1. **Map View** – 층 선택 버튼 + 지도(`FloorSectionMap`)로 섹션을 직관적으로 고릅니다.
2. **Detail View** – 좌우 네비게이션과 dot 인디케이터로 섹션 페이지를 넘기고, 수박 아이콘 2열 그리드가 실시간 현황을 보여줍니다.
   - 카드 클릭 → Drawer에 현재/직전 사용자·만료일·대여 버튼 표시.
   - `/v4/cabinets`, `/v4/cabinets/{id}`는 공개 API로 읽어오고, 대여/반납은 토큰 필요.
3. **상태 요약** – “대여 가능/대여중/점검/선택됨” 범례로 색만 보고 상태 파악.

### 3. 내 사물함 `/my/lockers`

- 내 계정 정보, 보유 코인, 현재 사물함 상태, 자동 연장 토글/반납 요청(사진 업로드) 기능을 한 카드에 배치.
- `myItems` 목록에서 각 티켓에 맞는 “사용” 버튼을 제공:
  - 연장권 `/v4/lent/extension`
  - 이사권 `/v4/lent/swap/{newCabinetId}`
  - 감면권 `/v4/lent/penalty-exemption`
- 성공/실패는 Chakra Toast와 TanStack Query invalidate로 즉시 반영.

### 4. 스토어 `/store`

- 4개의 상품 카드 (대여권은 구매 불가, 연장/이사/감면권만 구매 가능). 클릭한 카드만 로딩 상태가 나타나 사용자가 혼동하지 않습니다.
- `STORE_ITEM_IDS` 상수에 itemId를 모아 API 명세가 바뀌어도 한 곳에서 조정 가능.

### 5. 출석 `/attendance`

- `useAttendanceQuery`가 GET `/v4/users/attendance` 응답을 달력에 표시.
- “오늘 출석 체크” 버튼 → POST `/v4/users/attendance`, 이미 체크했다면 버튼 disabled + 안내문.

### 6. 정책 `/policy`

- `.env` 기반으로 정책 제목/연락처/요약을 수정할 수 있고, Chakra Card로 하이라이트를 제공합니다.

---

## OAuth & 토큰 플로우

1. **로그인 버튼** – 반드시 `<a href="{VITE_AUTH_BASE_URL}/oauth2/authorization/42">` 혹은 `window.location.href`로 이동합니다. AJAX 요청 금지.
2. **리다이렉트** – 백엔드가 `http://localhost:5173/#token=ACCESS_TOKEN`으로 리다이렉트하면 `main.tsx`가 해시 토큰을 파싱하여 `localStorage(subak_access_token)`에 저장하고 주소창을 정리합니다.
3. **Access Token 적용** – axios `apiClient`가 헤더에 `Authorization: Bearer {token}`을 자동 첨부합니다.
4. **401 처리** – 한 번만 `/v4/auth/reissue`를 호출하고 성공 시 원 요청을 재시도합니다. 재발급도 실패하면 토큰을 삭제하고 홈으로 이동합니다.

---

## 확인 체크리스트

1. `npm run dev` 실행 후 `http://localhost:5173`
2. 로그인 → URL `#token=` → 새로고침 없이 헤더 사용자 정보 표기
3. 홈: UsageSummary 카드/스토리 카드/섹션 하이라이트 확인
4. `/lockers`: 지도 → 섹션 선택 → 수박 아이콘 그리드 → Drawer → “이 사물함 대여하기”
5. `/my/lockers`: 코인·사물함 정보·아이템 사용 버튼 + 반납 사진 업로드
6. `/store`: 단일 카드만 로딩
7. `/attendance`: 출석 버튼 + 달력 하이라이트
8. `/policy`: 환경변수 기반 정보 렌더링

---

## 앞으로의 확장 아이디어

- 관리자 전용 탭을 RBAC로 노출
- cabinetId ↔ visibleNum 매핑 API 연결 (현재는 번호=ID 가정)
- 실내 지도 / beacon 데이터와 연동한 위치 안내
- SSR 혹은 앱셸 prefetch 최적화
