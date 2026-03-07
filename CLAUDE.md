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
- When passing data to client components, pass Promise and use `<Use>` from react-flowify to unwrap
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
  ├── FormNameHeader.tsx      # Title, close button, etc.
  ├── FormNameContents.tsx    # Form fields (inputs, selects, etc.)
  ├── FormNameActions.tsx     # Button area (cancel, save, etc.)
  └── index.tsx               # Composition and export
  ```

### Coding Style
- **Components**: Use function declarations (`function Component() {}`)
- **Custom hooks**: Use arrow functions (`const useHook = () => {}`)
- **File naming**: kebab-case for components (e.g., `my-component.tsx`), camelCase for hooks (e.g., `useSomething.ts`)
- **UI components**: Use shadcn/ui as the base
- **Declarative JSX**: Use `react-flowify` components instead of imperative patterns:

  | Imperative Pattern | react-flowify | When to Use |
  |-----------|---------------|-----------|
  | `{cond && <X />}` | `<Show when={cond}>` | Boolean conditional rendering |
  | `{cond ? <A /> : <B />}` | `<Show when={cond} fallback={<B />}>` | Conditional + fallback |
  | `{val && <X name={val.name} />}` | `<Guard when={val}>{(v) => <X name={v.name} />}</Guard>` | Nullable type narrowing |
  | `switch/case` rendering | `<Switch value={v} by={{ a: <A />, b: <B /> }} />` | Value-based branching |
  | `items.map(...)` | `<Each items={items} renderEmpty={<Empty />}>{(item, meta) => ...}</Each>` | List + empty state |
  | Direct `use(promise)` call | `<Use promise={p}>{(data) => ...}</Use>` | Promise unwrap |
  | Nested Suspense + ErrorBoundary | `<AsyncBoundary suspense={...} errorBoundary={...}>` | Async boundary |
  | useEffect + ref outside click | `<OutsideClick onOutsideClick={fn}>` | Outside click detection |
  | CSS media query conditional rendering | `<Responsive.Mobile>` / `<Responsive.Desktop>` | Responsive branching |

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
- **Exhaustive switch**: Use `switch` with `default: satisfies never` for **logic/value branching** only. For **JSX rendering**, use `<Switch>` from react-flowify instead
  ```typescript
  // Logic/value branching — use switch
  switch (status) {
    case "pending": return "loading...";
    case "success": return data.name;
    default: return status satisfies never;
  }

  // JSX rendering — use <Switch>
  <Switch value={status} by={{
    pending: <Spinner />,
    success: <SuccessView />,
    error: <ErrorView />,
  }} />
  ```
### State Management
- **Prefer useReducer over multiple useState**: When managing related state values, use `useReducer` instead of multiple `useState` calls

### Suspense & Error Handling
- **Global error**: `app/error.tsx`, `app/dashboard/error.tsx` - handled automatically by Next.js
- **Suspense + ErrorBoundary together**: Use `<AsyncBoundary>` from react-flowify
  ```tsx
  <AsyncBoundary
    suspense={{ fallback: <Skeleton /> }}
    errorBoundary={{ fallback: <ErrorUI /> }}
  >
    <AsyncComponent />
  </AsyncBoundary>
  ```
- **Suspense only** (no error boundary needed): Use `Suspense` compound component from `@/components/ui/suspense`
  - Available variants: `Suspense.Spinner`, `Suspense.Skeleton`, `Suspense.CardSkeleton`
  ```tsx
  <Suspense.Skeleton skeleton={<MySkeleton />}>
    <AsyncComponent />
  </Suspense.Skeleton>
  ```
- **ErrorBoundary only** (no suspense needed): Use `ErrorBoundary` compound component from `@/components/ui/error-boundary`
  - Available variants: `ErrorBoundary` (default), `ErrorBoundary.Compact`, `ErrorBoundary.Custom`
  ```tsx
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
    result: T | null;    // Data on success, null on error
    error: ApiError | null;  // null on success, error info on failure
  }

  interface ApiError {
    code: string;        // VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, etc.
    message: string;     // User-facing message
    details?: unknown;   // Additional info (validation error list, etc.)
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
- **Frontend usage**: `fetch-client.ts` automatically extracts `result`, throws `ApiException` on `error`
  ```typescript
  try {
    const event = await api.events.get("123"); // auto result extraction
  } catch (e) {
    if (e instanceof ApiException) {
      console.log(e.code, e.message);
    }
  }
  ```

### Testing & Development Cycle
- **Always write tests for important logic**: When creating functions or hooks with significant logic, write test code
- **Development cycle**: Develop → Write tests → Verify with `pnpm test:run` → Done
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
