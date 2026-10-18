# SUBAK 이용안내 및 로그인 링크 변경

## 구현

- `/login`: 로그인 버튼 아래에 “42경산 교육생이 아니신가요?” 링크 추가. 요청한 공식 URL에 `target="_blank"`, `rel="noopener noreferrer"`, 새 탭 접근성 설명 적용. OAuth 구현은 변경하지 않음.
- `/lockers`: 대여 버튼을 누르면 안내 미완료 계정에 A(대여) → B(반납) → C(수동 반납), 총 7단계를 표시. 마지막 “안내 확인 후 대여하기”를 눌러야 기존 예약 API 이후 기존 대여 API 실행. 닫기·Escape·바깥 영역 클릭으로 취소하면 대여 요청과 완료 저장 모두 발생하지 않음.
- `/lockers`의 페이지 헤더(층·섹션 선택), 상태 범례, 상세 Drawer에서 A 도움말 제공.
- `/my/lockers`의 페이지 헤더와 반납 사진·비밀번호 모달에서 B 도움말 제공. 수동 반납 단계에서는 C 도움말로 전환.
- 도움말은 중첩 Chakra Modal로 표시해 선택한 사물함, 촬영 사진, 비밀번호, 수동 반납 사유를 유지. 단계 이동 후 제목으로 초점 이동, 포커스 트랩, Escape 닫기, 트리거로 초점 복귀, 이미지 대체 텍스트 제공.
- 모바일에서는 전체 화면, 본문 내부 스크롤과 고정 하단 버튼 사용. 이미지 비율을 보존하며 안내 사진은 클릭 이동 없이 화면 안에서 표시함.

## 서버 최초 대여 여부 판단

`GET /v4/users/me`의 `isFirstRental`이 정확히 `true`이면 전체 7단계를 표시하고, `false`이면 바로 예약/대여 절차를 진행한다. 기존 localStorage 안내 기록과 세션 메모리는 읽거나 쓰지 않는다. 필드가 없거나 boolean이 아니거나 `/me` 조회가 실패하면 새로고침 안내와 함께 요청을 차단한다.

마지막 확인 전에 예약·대여 API는 호출하지 않는다. 마지막 확인 후 새 예약을 만들고 대여를 진행하며, 이미 같은 번호를 예약했다면 POST를 재호출하지 않는다. 대여 성공 후 `/me`를 재조회해 서버의 이력 기준 값을 반영한다. 대여 실패 시 서버가 여전히 최초 대여로 응답하면 다음 시도에서도 안내를 표시한다. 도움말 사용은 서버 최초 대여 상태에 영향을 주지 않는다.

자세한 예약 동작과 테스트 결과는 [reservation-integration.md](reservation-integration.md)를 참고한다.

## 현재 코드와 안내 정책의 차이

백엔드는 읽기만 했으며 파일을 수정하지 않았다.

1. **일반 대여도 안내 확인 후 예약한다.** 새 예약은 `POST /v4/lent/reservation/:visibleNum`으로 생성하고 최신 서버 예약을 확인한 뒤 기존 대여 API를 호출한다. 기존 예약은 재사용하고, 다른 예약이 있으면 변경 확인을 먼저 받는다. 최종 이사는 기존 swap API의 단일 트랜잭션을 유지한다.
2. **비밀번호 일치 여부를 인증하지 않는다.** 현재 서버의 `LentController`는 `previousPassword`의 숫자 4자리 형식만 확인한다. 일반·수동 반납 모두 같은 필드를 받아 `LentHistory.returnMemo`에 저장하며, 기존 비밀번호와 비교하는 로직은 없다. 물리적 잠금장치의 초기화 여부도 확인하지 않는다. 요청받은 안내에 따라 일반 반납은 “사용 중 설정했던 비밀번호”, 수동 반납은 “설정 전 초기 비밀번호”로 구분해 표시했으며 전송 필드·유효성 검사·인증 로직은 유지했다. 실제 운영에서 두 값의 의미와 초기화 절차가 적절한지는 백엔드/운영 담당자 확인이 필요하다. 초기 비밀번호를 임의로 지정하지 않았다.
3. **AI 2회 실패는 현재 FE의 모달 내 실패 횟수 기준이다.** 기존 구현은 이미지 검증 요청의 모든 오류를 실패로 센다(네트워크 오류도 포함). 서버는 2회 실패를 강제하지 않으며, 반납 요청 때 AI를 다시 실행해 결과와 `forceReturn`에 따라 일반 완료 또는 수동 처리한다. 기존 조건과 payload는 변경하지 않았다.
4. **수동 사유는 기존 API에서 선택 입력이다.** 도움말에서는 사유 작성을 안내하지만 필수 입력 검증은 추가하지 않았다.
5. **사용 중 표시의 배경은 주황색이다.** 요청한 안내 이미지와 현재 UI 모두 빨간 수박을 사용한다. 안내에는 “빨간색 수박”이라고 표기하고 주황색 배경에 대한 설명을 함께 제공했다.

## 이미지 출처 및 파일 목록

원본 디렉터리: `/Users/Seongik/Desktop/해커톤/대여반납안내사진/사진들`.
실제 파일명이 macOS Unicode 분해형이므로 이름을 확인해 복사했다. 원본 바이트를 변경하지 않았고 새 이미지 생성이나 라이브러리 설치는 없다. `src/assets/locker-guide/`의 8개 이미지를 정적 import하며 Vite 빌드에 포함한다.

| 원본 파일 | 프로젝트 파일 |
| --- | --- |
| `1.대여 섹션별 사물함 사진.png` | `rental-location.png` |
| `2.대여 섹션별 사물함 사진.png` | `rental-section.png` |
| `2-1.각 사물함 상태(대여가능:수리혹은사용불가:사용중) 이미지.png` | `rental-status.png` |
| `3.대여 섹션별 사물함 사물함상세 확인및대여.png` | `rental-detail.png` |
| `4.반납 마이페이지 반납버튼 확인.png` | `return-start.png` |
| `5.반납 마이페이지 사진찍은후 ai검증 확인.png` | `return-photo.png` |
| `6.사진 검증이후 사물함사용비밀번호 입력.png` | `return-password.png` |
| `7.수동반납에 있어서 비밀번호 입력사진.png` | `manual-return.png` |

그 외 변경 파일:

- `src/app/routes/LoginPage.tsx`
- `src/app/routes/LockersPage.tsx`
- `src/app/routes/MyLockersPage.tsx`
- `src/features/lockers/components/LockerGuideModal.tsx`
- `src/features/lockers/components/LockerHelpButton.tsx`
- `src/features/lockers/data/lockerGuide.ts`
- `src/features/lockers/hooks/useRentalOnboarding.ts`
- `tests/locker-guide.browser.cjs`
- `docs/locker-guide.md`

## 검증 및 재현

2026-10-18, 운영 서버 배포 없이 로컬에서 검증.

```sh
npm run build
npm run lint
VITE_API_BASE_URL=http://127.0.0.1:4173/api npm run dev -- --host 127.0.0.1 --port 4173
```

별도 터미널에서 Playwright와 Chrome이 있는 환경으로 실행한다. 이번 작업에서는 Codex 내장 런타임을 사용했으며 프로젝트 의존성을 추가하지 않았다.

```sh
NODE_PATH=/Users/Seongik/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
/Users/Seongik/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
tests/locker-guide.browser.cjs
```

테스트는 모든 API 응답을 모의 처리하고 외부 요청을 차단한다. OAuth 버튼은 기존 이동 목적지를 확인하고, 소개 링크는 새 탭과 opener 차단을 확인한다. 공식 사이트 URL의 실제 접근 가능 여부는 별도로 확인했다. 실제 OAuth 인증, 실제 장치의 카메라·잠금장치, 실제 AI 판정 및 운영 API 통합은 이 테스트의 범위가 아니다.

- TypeScript 검사와 프로덕션 빌드 통과. Vite의 500kB 초과 번들 경고는 남아 있음.
- 새 가이드 컴포넌트·데이터·훅 및 로그인 파일 lint 통과. 수정한 기존 두 페이지에는 기존 경고만 있음.
- 최초 안내 작업 당시 전체 lint는 기존 9개 오류와 17개 경고로 실패했다. 이후 예약 연동에서는 변경 파일 ESLint를 별도로 확인했다. 오류 파일: `AttendancePage.tsx`, `AuthCallbackPage.tsx`, `MaintenancePage.tsx`, `AdminDashboard.tsx`, `useLockerData.ts`, `tokenStore.ts`. 이번 범위 밖 코드는 수정하지 않음.
- 브라우저 테스트: 세 OAuth 이동 목적지, 외부 링크 속성·새 탭, 7단계/8장 이미지 로딩, 이전/다음/닫기/Escape, 키보드 초점 제한, 모바일 320/390px와 데스크톱 1280px, 완료 전 API 차단, 서버 최초 대여 분기와 성공 후 재조회, 일반 반납, 두 번 실패 후 수동 반납, 도움말 후 사진·비밀번호·사유 유지, 기존 multipart payload 유지, localStorage 미사용을 확인.
- 스크린샷 기본 저장 경로: `/tmp/subak-guide-verification/`.
