변경된 파일들을 코드 리뷰해주세요.

1. `git diff --name-only` 로 변경된 파일 목록을 확인합니다.
2. `git diff --staged --name-only` 로 staged 파일도 확인합니다.
3. 변경된 각 파일을 읽고, 아래 기준으로 리뷰합니다:

## 리뷰 기준

### toss-frontend-fundamentals (프론트엔드 파일)
- **가독성**: 맥락 줄이기, 이름 붙이기, 위에서 아래로 읽히는지
- **예측 가능성**: 이름과 동작이 일치하는지, 반환 타입 통일
- **응집도**: 함께 변경되는 코드가 함께 있는지
- **결합도**: 변경 영향 범위가 최소화되었는지

### vercel-react-best-practices (React/Next.js 파일)
- 비동기 워터폴 없는지 (Promise.all 사용 여부)
- 번들 사이즈 최적화 (dynamic import, barrel import 회피)
- 불필요한 리렌더링 없는지
- 서버/클라이언트 경계 적절한지

### nestjs-best-practices (NestJS 파일)
- 모듈 구조, DI 패턴
- 에러 핸들링, validation
- 보안 (인증/인가)

### CLAUDE.md 프로젝트 규칙
- 파일 300-400줄 이하
- props 최대 6개
- useReducer 사용 여부
- 네이밍 컨벤션 (kebab-case 컴포넌트, camelCase 훅)

## 출력 형식

각 파일별로:
- **파일명**: `path/to/file.tsx`
- **위반 사항**: 규칙 ID와 함께 구체적 위치 (line number)
- **개선 제안**: 수정 코드 예시
- **심각도**: CRITICAL / HIGH / MEDIUM / LOW

마지막에 전체 요약을 제공합니다.
