# 서버 최초 대여 및 예약 API 연동

## 동작

- 최초 대여는 `/v4/users/me.isFirstRental`을 사용한다. `true`인 경우 기존 7단계 전체 안내를 표시한다. 정확한 boolean을 확인할 수 없거나 조회가 실패하면 요청을 차단하고 새로고침을 제공한다. localStorage는 최초 대여 분기에 사용하지 않는다.
- 안내의 마지막 확인 후에만 예약 POST를 호출한다. 같은 번호의 기존 예약은 재사용한다. 서버의 최신 예약과 계정을 다시 확인한 뒤 기존 대여 API를 실행하며 성공 후 `/me`를 다시 조회한다.
- 다른 번호의 예약이 있으면 변경 안내와 확인을 받는다. 변경은 서버의 원자적 POST 한 번으로 처리한다. DELETE 후 POST하지 않는다.
- 사물함 및 내 사물함 화면 진입, 브라우저 재접속, 화면 복귀 시 서버 상태를 조회한다. 대여 중인 사용자의 예약에는 “진행 중인 이사 이어하기”를 표시한다. 신규 대여 예약은 별도 이름과 대여 동작으로 구분한다.
- **이사 이어하기 연결 위치:** `LockersPage.handleResumeReservation`은 서버의 화면 표시 번호를 `swapTarget.visibleNum`에 넣고 `swapStep='return'`, `swapReturnStep='photo'`로 연다. 내 사물함에서는 라우터의 `resumeReservation` 상태로 이동한 뒤 `/me`를 재조회해 같은 단계로 연결한다. 예약 POST나 별도 반납 API를 호출하지 않는다.
- 기존 이사 사진 촬영 → AI 검증(또는 기존 수동 처리) → 비밀번호 → `POST /v4/lent/swap/:visibleNum` 흐름을 재사용한다. 최종 요청 직전에 사용자, 원래 대여 중인 사물함, 목표 예약을 재조회해 확인한다. 입력한 사진과 비밀번호는 서버 예약 정보가 잠시 없어져도 유지하며, 확인되지 않는 예약으로 최종 이사를 진행하지 않는다.
- 취소는 본문·파라미터 없는 `DELETE /v4/lent/reservation`을 사용한다. 200과 404는 정상 갱신하며, 그 밖의 오류에서는 임의로 예약을 지우지 않는다. 화면 표시용 loading과 함께 동기 잠금을 사용해 연속 클릭의 중복 요청도 차단한다.
- 예약 성공·실패·취소·대여·이사 완료 후 `/me`, 사물함 목록·요약·상세 캐시를 갱신한다. 409 및 네트워크 오류에서도 최신 서버 상태를 확인하고 예약 POST를 자동 재시도하지 않는다.
- 서버의 남은 초와 응답 시각을 기준으로 `MM:SS`를 표시한다. 0초가 되면 한 번 재조회하고 서버 상태를 따른다. 반복되는 0초 응답으로 무한 조회하지 않는다. 화면 복귀 시 시간과 서버 응답을 동기화한다.
- 예약 시간 `null`을 15분으로 보정하지 않는다. `/me` 예약 필드가 `null`이라고 예약 삭제·만료를 확정하거나 자동 예약을 생성하지 않는다. 상세에서 내 예약이 확인되지만 `/me`가 확인되지 않으면 동기화 버튼을 제공한다. 사용자에게 성공하지 않은 취소를 성공했다고 표시하지 않는다.
- `AVAILABLE` + `isReserved`인 사물함에 예약 배지를 표시한다. 본인 예약을 구분하고 다른 사람의 예약은 대여·이사 예약을 차단한다. DB `cabinetId`는 상세 조회에만, `visibleNum`은 예약·대여·이사에 사용한다. 로그인 사용자의 상세 조회는 인증 클라이언트를 사용한다.
- 서버 오류 메시지를 기존 Toast로 표시한다. 같은 예약 400은 일반 안내로, 409와 429는 재시도 시점을 설명하는 문구로 처리한다. 인증·자격 처리는 기존 체계를 유지한다.

## 수정 파일

- `src/types/user.ts`: 서버 최초 대여·예약 응답 타입
- `src/types/locker.ts`: 목록·상세 예약 응답 타입
- `src/features/users/hooks/useMeQuery.ts`: 관련 화면 진입·포커스 시 최신 조회
- `src/features/lockers/api/lockers.ts`: 취소, 인증된 상세 조회, 공통 실패 응답 처리
- `src/features/lockers/hooks/useLockerData.ts`: 예약/취소 mutation, 오류 안내, 관련 캐시 갱신
- `src/features/lockers/hooks/useRentalOnboarding.ts`: 서버 최초 대여 기준으로 전환
- `src/features/lockers/hooks/useReservationClock.ts`: 서버 시각 기준 예약 카운트다운
- `src/features/lockers/components/ReservationPanel.tsx`: 공통 예약 상태·이어하기·취소 UI
- `src/app/routes/LockersPage.tsx`: 신규 대여, 예약 변경, 복구, 목록/상세 표시 및 최종 이사 검증
- `src/app/routes/MyLockersPage.tsx`: 예약 상태 및 이어하기 연결
- `tests/locker-guide.browser.cjs`: 기존 회귀 테스트를 서버 최초 대여 기준으로 갱신
- `tests/reservation.browser.cjs`: 상태를 유지하는 모의 API 통합 테스트
- `docs/locker-guide.md`, `docs/reservation-integration.md`: 현재 구현·검증 문서

백엔드 파일, OAuth 코드, 로그인 소개 링크, 안내 이미지 8장, 이미지 클릭 동작, 운영 배포 설정은 수정하지 않았다. Git은 기존 `main`을 사용하며 새 브랜치·PR·강제 푸시는 사용하지 않는다.

## 검증

로컬 Vite를 다음과 같이 실행한다.

```sh
VITE_API_BASE_URL=http://127.0.0.1:4173/api npm run dev -- --host 127.0.0.1 --port 4173
```

Playwright와 Chrome이 있는 런타임에서 다음 두 스크립트를 실행한다. 이번 환경에서는 Codex에 번들된 Playwright를 `NODE_PATH`로 지정하며 의존성을 설치하지 않았다.

```sh
node tests/locker-guide.browser.cjs
node tests/reservation.browser.cjs
```

테스트는 로컬 API를 모의 처리하며 다른 호스트로의 요청을 차단한다. 운영 사용자의 사물함·예약을 수정하지 않는다.

확인한 시나리오:

- 서버 최초 사용자·경험자 분기, 다른 브라우저에서도 같은 기준 유지, 과거 localStorage 기록 무시, 안내 취소 시 API 호출 없음, 완료 후 예약 → 대여 순서, 필드 누락·조회 실패 시 차단
- 기존 7단계, 원본 이미지 8장, 도움말, 이미지 링크 없음, 로그인 소개 링크·3종 OAuth 이동 경로
- 일반 신규 대여와 기존 신규 대여 예약 이어하기, AI 반납, 2회 실패 후 수동 반납, 입력값 유지
- 12번 예약 생성, 12→15 원자적 변경, 같은 번호 이어하기 시 POST 없음, 변경 실패 시 기존 번호·만료 시각 유지
- 다른 사람 예약 차단, 같은 예약·이사권 부족·이용 불가 400, 403, 409, 429, 응답을 받지 못했지만 서버는 처리한 네트워크 오류
- 취소 200, 취소 404 정상 갱신, 취소 실패 시 유지, 연속 클릭 DELETE 한 번, 본문 없음
- 새로고침 및 별도 브라우저 예약 복구, 내 사물함→사진 검증 단계 연결, 복구 시 15분 초기화 없음
- 짧은 TTL로 모의한 예약 만료 재조회, 반복 0초 응답의 조회 반복 방지, 화면 복귀 동기화, Redis null 응답 시 자동 예약 없음
- 복구 후 사진·AI·비밀번호와 기존 multipart payload로 최종 이사 확정, 별도 반납 API 호출 없음
- 320px 예약 패널·이사 모달 가로 넘침 없음, 기존 모바일·데스크톱 안내 UI

TypeScript 및 프로덕션 빌드를 확인하고 변경 TS/TSX 파일 ESLint를 실행한다. 기존 두 페이지의 경고와 Vite 번들 크기 경고는 남아 있다. 실제 OAuth 인증·AI 결과·물리 카메라/잠금장치·운영 데이터에 대한 쓰기 테스트는 수행하지 않는다.
