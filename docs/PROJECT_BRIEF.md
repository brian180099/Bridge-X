# Bridge X Project Brief

Bridge X는 회의록 서비스가 아니라 **Agent Handoff & Context Coordination** 플랫폼의 프로토타입이다. 프로젝트 목표를 입력하면 Manager Agent가 업무를 분배하고, 각 전문 Agent가 권한과 완료 조건을 포함한 **Agent Passport**와 **Structured Handoff**를 기준으로 결과를 만든다.

## 사용자 흐름

프로젝트 목표·조직·적용 범위·승인자 입력 → Manager Agent 분배 → 전문 Agent 실행 → Handoff Inspector 비교 → **Conflict Detection** → **Human Approval Gate** → 승인 이유가 **Decision Context**와 다음 Handoff evidence에 반영 → **Audit Log** 기록.

## 구현 원칙

- 현재는 **내부 Agent Simulation**이며 외부 Agent 플랫폼과 연동되었다고 주장하지 않는다.
- Handoff는 goal, output, evidence, assumptions, mustKeep, canChange, completionCriteria, openQuestions를 가진 실행 계약이다.
- 숫자·일정·mustKeep·권한·승인 조건·근거·완료 조건·수신 해석 누락을 규칙 기반으로 검사한다.
- 충돌이 있으면 자동 진행하지 않고 사람의 승인·수정 요청·담당자 재검토·실행 중단 중 하나를 이유와 함께 기록한다.
- MeetingApp·녹음·전사는 삭제하지 않고 **Evidence Capture** 보조 입력 계층으로 둔다.
