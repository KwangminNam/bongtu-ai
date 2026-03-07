$ARGUMENTS 파일을 리팩토링해주세요.

1. 대상 파일을 읽고 현재 상태를 파악합니다.
2. 아래 기준으로 문제점을 분석합니다.
3. 리팩토링을 실행합니다.
4. 관련 테스트가 있으면 실행하여 깨지지 않았는지 확인합니다.

## 분석 기준

### toss-frontend-fundamentals
- `readability-context-separate-code-paths`: 같이 실행되지 않는 코드 분리
- `readability-context-abstract-implementation`: 구현 상세 추상화
- `readability-naming-complex-conditions`: 복잡한 조건에 이름 붙이기
- `readability-flow-simplify-ternary`: 중첩 삼항 연산자 단순화
- `cohesion-colocate-modified-files`: 함께 변경되는 코드 co-locate
- `coupling-single-responsibility`: 하나의 책임만 갖도록
- `coupling-eliminate-props-drilling`: props drilling 제거

### vercel-react-best-practices
- `async-parallel`: 독립 비동기 작업 병렬화
- `bundle-dynamic-imports`: 무거운 컴포넌트 동적 import
- `rerender-functional-setstate`: 안정적 콜백을 위한 함수형 setState
- `rerender-derived-state-no-effect`: effect 대신 렌더 중 파생 상태

### CLAUDE.md 규칙
- 파일 300-400줄 초과 시 분리
- props 6개 초과 시 Compound Component 또는 Context 사용
- 여러 useState → useReducer 전환
- react-flowify 컴포넌트 활용 (Switch, Show, Guard, Each)

## 실행 순서

1. 파일 읽기 + 줄 수 / props 수 확인
2. 위반 사항 목록 출력
3. 리팩토링 실행 (파일 수정/분리)
4. `pnpm test:run` 으로 테스트 확인
5. 변경 요약 출력
