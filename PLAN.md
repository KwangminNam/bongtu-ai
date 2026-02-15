# 봉투AI 구현 계획 (하이브리드 C 방식)

## Phase 1: Server 기반 구축 (Prisma + Auth)

### 1-1. PrismaModule
- `server/src/prisma/prisma.module.ts` — 글로벌 모듈
- `server/src/prisma/prisma.service.ts` — PrismaClient 래퍼

### 1-2. AuthModule (NestJS ↔ NextAuth JWT 연동)
- `server/src/auth/auth.module.ts`
- `server/src/auth/jwt.strategy.ts` — NextAuth가 발급한 JWT 검증
- `server/src/auth/jwt-auth.guard.ts`
- `server/src/auth/decorators/current-user.decorator.ts` — 요청에서 유저 추출

### 1-3. UserModule
- `server/src/user/user.module.ts`
- `server/src/user/user.service.ts` — findOrCreate (소셜 로그인 시 자동 생성)

### 1-4. Client NextAuth 설정
- `client/src/lib/auth.ts` — NextAuth config (Google, Kakao provider, JWT callback)
- `client/src/app/api/auth/[...nextauth]/route.ts` — NextAuth Route Handler
- `client/src/middleware.ts` — 인증 미들웨어

## Phase 2: CRUD API + UI

### 2-1. Server CRUD Modules
각각 module / controller / service / dto 파일:
- `server/src/event/` — Event CRUD
- `server/src/friend/` — Friend CRUD
- `server/src/record/` — Record CRUD (1:N 일괄 등록 포함)

### 2-2. Client 페이지 & 컴포넌트
- `client/src/app/(dashboard)/layout.tsx` — 대시보드 레이아웃 (사이드바)
- `client/src/app/(dashboard)/events/page.tsx` — 이벤트 목록/생성
- `client/src/app/(dashboard)/events/[id]/page.tsx` — 이벤트 상세 (기록 목록)
- `client/src/app/(dashboard)/friends/page.tsx` — 지인 목록/관계 관리
- `client/src/app/(dashboard)/friends/[id]/page.tsx` — 지인 타임라인
- shadcn/ui 컴포넌트 추가: Button, Input, Dialog, Card, Badge, Table 등

### 2-3. Client API 유틸
- `client/src/lib/api.ts` — NestJS API 호출 래퍼 (JWT 헤더 자동 첨부)

## Phase 3: AI 채팅 (하이브리드)

### 3-1. Server AI Module
- `server/src/ai/ai.module.ts`
- `server/src/ai/ai.controller.ts` — `POST /ai/chat` SSE 스트리밍 엔드포인트
- `server/src/ai/ai.service.ts` — OpenAI 호출 + Function Calling 정의
- Function tools: `query_records`, `search_friends`, `get_event_stats`, `suggest_amount`

### 3-2. Client AI 채팅
- `pnpm --filter @bongtu-ai/client add ai @ai-sdk/openai` (Vercel AI SDK 설치)
- `client/src/app/api/chat/route.ts` — Next.js Route Handler (NestJS `/ai/chat`으로 프록시)
- `client/src/app/(dashboard)/chat/page.tsx` — 채팅 UI (`useChat` 훅)
- `client/src/components/chat/` — ChatMessage, ChatInput 컴포넌트

## Phase 4: 스마트 입력 + 고도화
- 텍스트 파서 (카톡/문자 복붙 → AI가 이름/금액 추출)
- 1:N 일괄 등록 UI (금액 뱃지 + 지인 다중 선택)

---

## 구현 순서
1 → 2 → 3 → 4 순서대로 진행. Phase 1이 끝나야 나머지 동작 가능.

## 검증 방법
- Phase 1: `pnpm dev:server` 후 Postman으로 JWT 인증 테스트
- Phase 2: `pnpm dev` 후 브라우저에서 CRUD 동작 확인
- Phase 3: 채팅 UI에서 "홍길동이 내 결혼식 때 얼마 냈어?" 질의 테스트
