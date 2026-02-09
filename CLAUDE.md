# CLAUDE.md

## Tech Stack

- **Client**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Server**: NestJS, TypeScript, Prisma
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Client on Vercel, Server on SST/Serverless
- **Package Manager**: pnpm
- **Testing**: Vitest (unit), Playwright (e2e)

## Project Structure

```
client/src/
├── app/              # Next.js App Router
├── components/       # Shared components
│   └── ui/           # shadcn/ui components
├── lib/              # Utils, types, constants, API
└── hooks/            # Shared hooks

server/src/
├── auth/
├── event/
├── friend/
├── record/
└── ocr/
```

## Rules

### Data Fetching & SSR
- Default to SSR for data fetching
- Wrap only async components with Suspense/ErrorBoundary, NOT at page level
- When passing data to client components, pass Promise and use `use()` hook to resolve
- Use Next.js `revalidatePath`/`revalidateTag` for refetching - NO TanStack Query

### Component & Hook Organization
- Shared/reusable components go in `src/components`
- Page-specific components go in `_components` folder within the page directory
- Page-specific hooks go in `_hooks` folder within the page directory
- **No nested underscore folders** (e.g., `_components/_components` is forbidden)

### File Size & SRP (Single Responsibility Principle)
- **Keep files under 300-400 lines** - if exceeding, split into smaller components
- **Max 6 props per component** - if more needed, consider:
  1. Extract child component with its own state/logic into separate file
  2. Use Compound Component pattern for composable UI
  3. Use Context to share state without prop drilling
- **State/function locality**: If state or function is only used by a child component, move it to the child component file
- **Compound Components**: When building complex UI with multiple related parts, prefer compound pattern
  ```tsx
  // Instead of prop drilling
  <Form onSubmit={...} title={...} type={...} date={...} error={...} loading={...} />

  // Use compound pattern
  <Form>
    <Form.Header />
    <Form.Fields />
    <Form.Submit />
  </Form>
  ```
- **Form Component Structure**: Split form components into semantic parts
  ```
  FormName/
  ├── FormNameHeader.tsx      # 제목, 닫기 버튼 등
  ├── FormNameContents.tsx    # 폼 필드들 (입력, 선택 등)
  ├── FormNameActions.tsx     # 버튼 영역 (취소, 저장 등)
  └── index.tsx               # 조합 및 export
  ```

### Coding Style
- **Components**: Use function declarations (`function Component() {}`)
- **Custom hooks**: Use arrow functions (`const useHook = () => {}`)
- **File naming**: kebab-case for components (e.g., `my-component.tsx`), camelCase for hooks (e.g., `useSomething.ts`)
- **UI components**: Use shadcn/ui as the base

### Code Quality — Frontend Fundamentals

> Good code = **code that is easy to change**. The 4 criteria below may conflict — when they do, decide by asking "Which option makes this code easier to change?"
> Source: https://frontend-fundamentals.com/code-quality/code/

#### 1. Readability — Reduce context the reader must hold at once; code should read top-to-bottom

**A. Reduce context**
- **Separate non-concurrent code paths**: If branches never execute together (e.g., role-based rendering), extract each into its own component instead of mixing with conditionals
  ```tsx
  // Bad
  function SubmitButton() {
    const isViewer = useRole() === "viewer";
    useEffect(() => { if (isViewer) return; showButtonAnimation(); }, [isViewer]);
    return isViewer ? <TextButton disabled>Submit</TextButton> : <Button type="submit">Submit</Button>;
  }
  // Good — split into ViewerSubmitButton / AdminSubmitButton
  ```
- **Abstract implementation details**: Wrap low-level logic so the reader only sees "what", not "how" (e.g., AuthGuard wrapper, dedicated InviteButton)
- **Split hooks that mix unrelated concerns**: One hook = one concern (see also Coupling §4)

**B. Name things**
- **Name complex conditions**: Extract `category.id === targetCategory.id` into `const isSameCategory = ...`
- **Name magic numbers**: `await delay(300)` → `await delay(ANIMATION_DELAY_MS)` — make intent explicit

**C. Top-to-bottom reading**
- **Reduce perspective shifts**: Avoid forcing the reader to jump between files/functions to understand one behavior; prefer inline objects or switch statements
- **Simplify ternaries**: Replace nested ternaries with IIFE + if-return or switch
  ```tsx
  // Bad
  const status = A && B ? "BOTH" : A || B ? (A ? "A" : "B") : "NONE";
  // Good
  const status = (() => {
    if (A && B) return "BOTH";
    if (A) return "A";
    if (B) return "B";
    return "NONE";
  })();
  ```
- **Math-order range checks**: Write `minPrice <= price && price <= maxPrice` instead of `price >= minPrice && price <= maxPrice`

#### 2. Predictability — Behavior should be obvious from name, params, and return type

- **No name collisions with different behavior**: If a wrapper adds auth, name it differently (`http.get` → `httpService.getWithAuth`)
- **Unify return types for same-kind functions**: All validation functions should return `{ ok: boolean; reason?: string }`, not a mix of booleans and objects
  ```tsx
  // Bad — checkIsNameValid returns boolean, checkIsAgeValid returns { ok, reason }
  // Good — both return { ok: true } | { ok: false; reason: string }
  ```
- **No hidden side effects**: If a function's name is `fetchBalance`, it should only fetch — move logging/tracking to the call site so the reader isn't surprised

#### 3. Cohesion — Code that must change together should live together

- **Co-locate by domain, not by type**: Prefer `domains/Payment/{components,hooks,utils}` over top-level `components/`, `hooks/`, `utils/` folders with hundreds of files
- **Eliminate magic numbers for cohesion**: Beyond naming (see Readability §B), co-locate the constant with the code it depends on so related changes happen together
- **Choose form cohesion strategy intentionally**:
  - Field-level (each field validates itself): when fields are independent and reusable
  - Form-level (Zod schema validates all): when fields have cross-dependencies (password confirm, total calc)

#### 4. Coupling — Minimize the blast radius when code changes

- **Single-responsibility hooks**: One hook = one concern. A catch-all `usePageState()` forces every consumer to re-render on any param change
- **Allow duplication over premature abstraction**: If pages may diverge in behavior (different logging, different UI text), keep separate implementations instead of a shared hook/component that accumulates `if` branches
- **Eliminate Props Drilling**: When a middle component passes props it never uses, refactor with Composition (`children`) first; use Context only when composition isn't enough
  ```tsx
  // Bad — ItemEditBody receives recommendedItems/onConfirm just to forward them
  // Good — use children so ItemEditList receives props directly from parent
  ```

### TypeScript
- **No `any` type** - use `unknown` or proper types instead
- **Reuse types via ComponentProps**: Use `ComponentProps<typeof SomeComponent>` with `Pick`/`Omit` to derive types - avoid duplicating type definitions
- **Exhaustive switch**: Use `switch` for complex conditionals with `default: satisfies never` to ensure all cases are handled
  ```typescript
  switch (status) {
    case "pending": return <Pending />;
    case "success": return <Success />;
    default: return status satisfies never;
  }
  ```
### State Management
- **Prefer useReducer over multiple useState**: When managing related state values, use `useReducer` instead of multiple `useState` calls

### Suspense & Loading UI
- Use the custom `Suspense` compound component from `@/components/ui/suspense`
- Available variants: `Suspense.Spinner`, `Suspense.Skeleton`, `Suspense.CardSkeleton`
- To add new loading UI patterns, extend the compound component in `suspense.tsx`
  ```tsx
  // Usage
  <Suspense.Skeleton skeleton={<MySkeleton />}>
    <AsyncComponent />
  </Suspense.Skeleton>
  ```

### Error Handling
- **Global error**: `app/error.tsx`, `app/dashboard/error.tsx` - Next.js 자동 처리
- **Specific area**: `ErrorBoundary` compound component from `@/components/ui/error-boundary`
- Available variants: `ErrorBoundary` (default), `ErrorBoundary.Compact`, `ErrorBoundary.Custom`
  ```tsx
  // Suspense와 함께 사용
  <ErrorBoundary>
    <Suspense.Skeleton skeleton={<MySkeleton />}>
      <AsyncComponent />
    </Suspense.Skeleton>
  </ErrorBoundary>

  // 간단한 에러 표시
  <ErrorBoundary.Compact>
    <Component />
  </ErrorBoundary.Compact>
  ```

### Backend
- The user is a frontend developer, so **pay extra attention to backend code quality**
- Ensure proper error handling, validation, and type safety in NestJS code

### API Response Format
- **All API responses** use standard `ApiResponse<T>` wrapper format
- Response structure:
  ```typescript
  interface ApiResponse<T> {
    result: T | null;    // 성공 시 데이터, 에러 시 null
    error: ApiError | null;  // 성공 시 null, 에러 시 에러 정보
  }

  interface ApiError {
    code: string;        // VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED 등
    message: string;     // 사용자에게 보여줄 메시지
    details?: unknown;   // 추가 정보 (validation 에러 목록 등)
  }
  ```
- **Success response**: `{ result: { id, title, ... }, error: null }`
- **Error response**: `{ result: null, error: { code: "NOT_FOUND", message: "..." } }`
- **Error codes**:
  | HTTP Status | Error Code |
  |-------------|------------|
  | 400 | `VALIDATION_ERROR` |
  | 401 | `UNAUTHORIZED` |
  | 403 | `FORBIDDEN` |
  | 404 | `NOT_FOUND` |
  | 409 | `CONFLICT` |
  | 500 | `INTERNAL_ERROR` |
- **Frontend usage**: `fetch-client.ts`가 자동으로 `result` 추출, `error` 시 `ApiException` throw
  ```typescript
  try {
    const event = await api.events.get("123"); // 자동 result 추출
  } catch (e) {
    if (e instanceof ApiException) {
      console.log(e.code, e.message);
    }
  }
  ```

### Testing & Development Cycle
- **Always write tests for important logic**: When creating functions or hooks with significant logic, write test code
- **Development cycle**: 개발 → 테스트 작성 → `pnpm test:run` 확인 → 완료
- **What to test (unit)**:
  - Custom hooks with state management (useReducer, complex useState)
  - Utility functions with business logic
  - Data transformation functions
  - Validation logic
- **Test location**: Place test files next to the source file (e.g., `useSomething.ts` → `useSomething.test.ts`)
- **Test framework**: Vitest + @testing-library/react + happy-dom

### E2E Testing (MANDATORY)
- **When a new page or feature is added, writing and running e2e tests is REQUIRED** — do not consider the task complete until e2e tests pass
- **Development cycle**: Implement feature → Write e2e test → Run `pnpm e2e` → Verify all tests pass → Done
- **What to test (e2e)**:
  - Every new page: verify it loads correctly with expected headings, buttons, and content
  - Every new user flow: form submissions, navigation, dialogs, CRUD operations
  - Interactions between pages: tab navigation, redirects after form submission
- **Test location**: `client/e2e/` directory
- **Auth mocking**: Use `mockAuth(page)` from `e2e/helpers/mock.ts` — it sets a real NextAuth v5 JWE session cookie for server-side auth
- **API mocking**: Use `mockEventsApi(page)`, `mockFriendsApi(page)` for intercepting backend calls. Add new mock functions in `e2e/helpers/mock.ts` when new API endpoints are introduced
- **Run commands**:
  - `pnpm e2e` — headless (CI)
  - `pnpm e2e:headed` — visible browser
  - `pnpm e2e:ui` — interactive UI mode

### Commands
- Use `pnpm` for all package operations
- Run unit tests with `pnpm test:run` (Vitest)
- Run e2e tests with `pnpm e2e` (Playwright)
- Build client with `pnpm run build` in client directory
