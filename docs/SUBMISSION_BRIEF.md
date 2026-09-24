# Bridge X 제출용 문안

## 서비스 링크

[https://bridge-x-omega.vercel.app](https://bridge-x-omega.vercel.app)

## 한 줄 소개

Bridge X는 서로 다른 AI Agent가 하나의 프로젝트를 수행할 때 업무·권한·맥락·근거·완료 조건을 안전하게 전달하고 충돌을 사람의 결정으로 조정하는 **Agent Handoff & Context Coordination** 프로토타입입니다.

## 문제 정의

여러 AI Agent를 연결해도 각 Agent가 이전 결과의 목적, 반드시 유지할 조건, 변경 권한과 완료 기준을 다르게 해석하면 잘못된 결과가 다음 단계로 전파됩니다. 특히 권한 밖 변경이나 근거 없는 제안이 자동 실행되면 사람이 개입해야 할 시점을 놓치게 됩니다.

## 해결 방법

1. 프로젝트 목표와 조직 맥락, 승인자를 입력합니다.
2. Manager Agent가 업무를 전문 Agent에 분배합니다.
3. Agent Passport가 각 Agent의 데이터 접근·변경·금지·승인 범위를 정의합니다.
4. 결과를 goal, output, evidence, assumptions, mustKeep, canChange, completionCriteria, openQuestions 구조의 Structured Handoff로 전달합니다.
5. Handoff Inspector가 송신 결과와 수신 Agent의 해석 차이를 비교합니다.
6. Conflict Detection이 숫자·일정·필수 조건·권한·근거·완료 조건을 검사합니다.
7. 충돌 시 Human Approval Gate에서 자동 진행을 멈추고 승인·수정 요청·재검토·중단을 결정합니다.
8. 결정 이유를 Decision Context, 다음 Handoff evidence, Audit Log에 기록합니다.

## 구현 현황

- 프로젝트 목표 기반 Agent Workflow
- Agent Passport
- Structured Handoff와 Handoff Inspector
- 규칙 기반 Conflict Detection
- Human Approval Gate와 GO/REVISE/STOP 상태
- Decision Context 및 Audit Log
- Express 개발 API와 Vercel Functions 경로
- API 장애 시 deterministic demo fallback
- MeetingApp 녹음·전사·분석을 Evidence Capture로 유지

## 현재 범위와 한계

현재 구현은 **내부 Agent Simulation**과 데모 세션용 in-memory 저장소를 사용하는 프로토타입입니다. 실제 외부 Agent 플랫폼 연동, 영속적인 팀 저장소, 완성된 자율 오케스트레이션이나 상용 운영 기능은 아직 제공하지 않습니다. 회의 전사 기능은 핵심 제품이 아니라 Handoff 근거를 수집하는 선택적 Evidence Capture 계층입니다.

## 기술 구성

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- API: Express + Vercel Functions
- Deployment: Vercel
- Test: Vitest
