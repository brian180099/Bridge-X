# Submission Brief

Bridge X는 서로 다른 AI Agent가 같은 프로젝트를 수행할 때 생기는 맥락 손실과 권한 충돌을 보여주는 **Agent Handoff & Context Coordination** 프로토타입이다.

첫 화면은 회의 녹음이 아니라 프로젝트 목표에서 시작한다. Agent Passport가 각 Agent의 접근·변경·금지·승인 범위를 보여주고, Structured Handoff를 Handoff Inspector에서 송신 결과와 수신 해석으로 비교한다. Conflict Detection이 충돌을 탐지하면 Human Approval Gate에서 자동 진행을 멈추고, 사람의 결정 이유를 Decision Context·다음 Handoff evidence·Audit Log에 남긴다.

제품 화면과 문서에는 **내부 Agent Simulation**임을 표시한다. MeetingApp의 녹음·전사·요약은 삭제하지 않았으며, 핵심 제품이 아니라 **Evidence Capture** 보조 계층이다. 영속적인 팀 저장소, 완성된 자율 Agent 오케스트레이션, 실제 외부 플랫폼 연동은 아직 구현하지 않았다.
