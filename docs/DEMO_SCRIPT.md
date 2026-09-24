# Demo Script

1. 첫 화면에서 프로젝트명, 목표, 적용 범위, 조직, 승인자를 입력한다. 화면에 “내부 Agent Simulation”과 프로젝트 목표 → Agent Passport → Manager Agent → Structured Handoff → Conflict Detection → Human Approval Gate → Audit Log 흐름이 보이는지 확인한다.
2. Workflow에서 Manager Agent가 목표를 분배하고, 전문 Agent의 상태와 Handoff 계약을 확인한다.
3. Passports에서 각 Agent의 접근 가능·제한 데이터, 변경 가능·금지 항목, 사람 승인 필요 항목을 확인한다.
4. Handoff Inspector에서 goal, output, evidence, assumptions, mustKeep, canChange, completionCriteria, openQuestions와 수신 해석·누락을 비교한다.
5. Conflict & Approval에서 실제 `ruleChecks`의 PASSED, FAILED, APPROVAL REQUIRED, NEEDS REVIEW 상태를 확인한다. 충돌 시 자동 진행이 중단된다.
6. 승인·수정 요청·담당자 재검토·실행 중단 중 하나를 선택하고 이유를 입력한다. 결정이 다음 Handoff evidence, Decision Context, Audit Log, 최종 GO/REVISE/STOP에 남는지 확인한다.
7. MeetingApp은 Evidence Capture로 이동해 회의 원문·전사·결정사항을 확인한다. 이 기능은 선택적 보조 입력이며 제품의 시작 CTA가 아니다.

## 고지

현재는 내부 Agent Simulation과 deterministic demo fallback이다. 실제 외부 Agent 플랫폼 연동, 상용 운영, 영속 저장은 이 출품본의 범위가 아니다.
