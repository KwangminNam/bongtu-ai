$ARGUMENTS 에 대한 e2e 테스트를 작성하고 실행해주세요.

## 실행 순서

1. 대상 페이지/기능 파악
   - 인자가 파일 경로면 해당 파일을 읽고 테스트 대상 파악
   - 인자가 기능 설명이면 관련 페이지 컴포넌트를 찾아서 파악
2. 기존 e2e 테스트 확인
   - `client/e2e/` 디렉토리의 기존 테스트 패턴 참고
   - `client/e2e/helpers/mock.ts`의 mock 함수 확인
3. e2e 테스트 작성
   - `client/e2e/` 디렉토리에 `{feature-name}.spec.ts` 파일 생성
   - 필요한 mock이 없으면 `helpers/mock.ts`에 추가
4. 테스트 실행
   - `pnpm e2e` 로 실행
   - 실패 시 원인 분석 후 수정
5. 결과 보고

## 테스트 작성 규칙

### 구조
```typescript
import { test, expect } from "@playwright/test";
import { mockAuth, mockEventsApi } from "./helpers/mock";

test.describe("기능 이름", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    // 필요한 API mock 추가
  });

  test("시나리오 설명", async ({ page }) => {
    // ...
  });
});
```

### 필수 테스트 항목
- 페이지 로딩: heading, 주요 버튼, 콘텐츠 노출 확인
- 사용자 흐름: 폼 입력 → 제출 → 결과 확인
- 네비게이션: 페이지 이동, 탭 전환, 리다이렉트
- 에러 케이스: 빈 상태, 실패 응답

### API Mocking
- `mockAuth(page)` — 인증 세션 설정 (항상 필요)
- `mockEventsApi(page)` — 이벤트 API mock
- `mockFriendsApi(page)` — 친구 API mock
- 새 API mock 필요 시 `helpers/mock.ts`에 추가

### 선택자 우선순위
1. `getByRole()` — 접근성 역할 기반 (최우선)
2. `getByText()` — 텍스트 기반
3. `getByTestId()` — data-testid 기반 (최후 수단)
