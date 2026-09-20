# Bridge X Backend

실제 백엔드는 [`apps/api`](../apps/api), Vercel 진입점은 [`api`](../api)에 있습니다.

- Express + TypeScript + Zod
- `POST /api/analyze`: Meaning Diff, Role Lens, Shared Contract, Receipt 생성
- OpenAI Responses API Structured Outputs 선택 연동
- 키가 없거나 호출이 실패해도 같은 응답 계약을 유지하는 데모 엔진
- API 키는 서버 환경변수에서만 읽고 브라우저 응답에 포함하지 않음

환경변수와 검증 방법은 [루트 README](../README.md)를 확인하세요.
