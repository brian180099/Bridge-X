# Service Plan

## 현재 제품 단위

1. 프로젝트 목표 입력
2. Agent Passport로 데이터 접근·변경 권한·승인 필요 항목 확인
3. Manager Agent의 내부 분배 시뮬레이션
4. goal/output/evidence/assumptions/mustKeep/canChange/completionCriteria/openQuestions 기반 Structured Handoff 생성
5. 송신 결과와 수신 Agent 해석 비교
6. Conflict Detection과 권한 검사
7. Human Approval Gate에서 GO·REVISE·STOP 결정
8. Decision Context와 Audit Log 기록
9. MeetingApp의 Evidence Capture를 선택적으로 연결

## API

개발 Express와 Vercel Functions 양쪽에 `POST /api/projects`, `POST /api/projects/:id/run`, `POST /api/runs/:id/approve`, `POST /api/runs/:id/reject`, `GET /api/projects/:id/timeline` 경로를 둔다.

저장소는 데모 세션용 in-memory다. 운영 환경에서 영속성·인증·외부 Agent 실행을 제공하는 단계는 아직 구현하지 않았다.
