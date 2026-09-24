# Bridge X 데모 스크립트

## 0:00–0:30 · 프로젝트 목표

첫 화면에서 프로젝트명, 목표, 적용 범위, 조직, 승인자를 입력한다. 화면의 **내부 Agent Simulation** 고지와 프로젝트 목표 → Agent Passport → Manager Agent → Structured Handoff → Conflict Detection → Human Approval Gate → Audit Log 흐름을 설명한다.

## 0:30–1:00 · Agent Workflow

Manager Agent가 프로젝트 목표를 해석하고 전문 Agent에 업무를 분배하는 흐름을 보여준다. 각 Agent의 대기·실행·결과 생성·승인 대기·완료 상태를 확인한다.

## 1:00–1:25 · Agent Passport

각 Agent의 접근 가능·제한 데이터, 변경 가능·금지 항목, 사람 승인이 필요한 항목을 확인한다. Agent가 무엇을 할 수 있고 무엇을 해서는 안 되는지 설명한다.

## 1:25–1:55 · Structured Handoff

Handoff Inspector에서 goal, output, evidence, assumptions, mustKeep, canChange, completionCriteria, openQuestions를 확인한다. 송신 결과와 수신 Agent의 이해·재확인 항목을 비교하며 Handoff가 다음 Agent의 실행 계약임을 보여준다.

## 1:55–2:30 · Conflict Detection

실제 `ruleChecks`의 PASSED, FAILED, APPROVAL REQUIRED, NEEDS REVIEW 상태를 확인한다. 필수 조건이나 권한 충돌이 있으면 자동 진행이 Human Approval Gate에서 중단됨을 보여준다.

## 2:30–2:50 · 사람 결정

승인·수정 요청·담당자 재검토·실행 중단 중 하나를 선택하고 이유를 입력한다. 결정이 다음 Handoff evidence, Decision Context, Audit Log, 최종 GO/REVISE/STOP에 반영되는지 확인한다.

## 2:50–3:00 · Evidence Capture와 결론

MeetingApp의 회의 녹음·전사·분석은 선택적 Evidence Capture 계층으로 유지됨을 설명한다. Bridge X의 핵심은 회의 요약이 아니라 Agent 간 실행 맥락과 권한을 안전하게 전달하는 것이라고 마무리한다.

## 발표 전 체크

- [https://bridge-x-omega.vercel.app](https://bridge-x-omega.vercel.app)과 `/api/health`가 열리는지 확인한다.
- 프로젝트 생성부터 승인·수정 요청까지 한 번 리허설한다.
- 네트워크 실패에 대비해 deterministic demo fallback을 확인한다.
- 현재는 외부 Agent 연동이 아닌 내부 Agent Simulation임을 명확히 말한다.
