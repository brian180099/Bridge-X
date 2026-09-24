# Bridge X

Bridge X는 서로 다른 전문 AI Agent가 하나의 프로젝트를 수행할 때 업무·권한·맥락·근거·제약·완료 조건을 관리하는 **Agent Handoff & Context Coordination** 프로토타입입니다. Agent 간 결과 충돌을 검사하고, 중요한 변경은 사람의 **Human Approval Gate**를 거쳐 다음 Agent로 전달합니다.

**배포 서비스:** [https://bridge-x-omega.vercel.app](https://bridge-x-omega.vercel.app)

현재 실행 범위는 실제 외부 Agent 플랫폼 연동이 아닌 **내부 Agent Simulation**입니다. API 데이터는 데모 세션용 in-memory 저장소에 보관되며, 완성된 상용 서비스나 영속적인 팀 협업 저장소가 아닙니다.

## 핵심 흐름

프로젝트 목표 → Agent Passport → Manager Agent 업무 분배 → 전문 Agent 실행 → **Structured Handoff** → **Conflict Detection**·권한 검사 → **Human Approval Gate** → Decision Context 전달 → 다음 Agent 실행 → **Audit Log**

## 주요 기능

- Agent별 접근 가능·제한 데이터, 변경 가능·금지 항목과 승인 조건을 보여주는 Agent Passport
- goal, output, evidence, assumptions, mustKeep, canChange, completionCriteria, openQuestions 기반 Structured Handoff
- 송신 Agent 결과와 수신 Agent 해석을 비교하는 Handoff Inspector
- 숫자·일정·필수 조건·권한·근거·완료 조건을 검사하는 Conflict Detection
- 승인, 수정 요청, 담당자 재검토, 실행 중단과 필수 결정 이유 입력
- Decision Context, 다음 Handoff evidence, Audit Log로 이어지는 결정 추적
- API 장애 시 재현 가능한 deterministic demo fallback

## Evidence Capture

기존 `MeetingApp`의 녹음·전사·회의 분석 기능은 삭제하지 않았습니다. 이 기능은 제품의 핵심 CTA가 아니라 회의 원문과 결정사항을 Handoff evidence로 연결하기 위한 선택적 **Evidence Capture** 계층입니다.

## 빠른 실행

필요 환경: Node.js 20 이상

```bash
npm install
npm run dev
```

웹은 `5173`, API는 `8787`에서 실행됩니다.

```bash
npm test
npm run build
```

## 기술 구성

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- API: Express 개발 서버 + Vercel Functions
- Deployment: Vercel Hosting
- Test: Vitest

## 현재 한계

- 외부 Agent 실행·인증·권한 시스템과 실제 연동하지 않습니다.
- 데모 API는 in-memory라 재시작하면 세션이 사라집니다.
- 규칙 기반 Conflict Detection과 deterministic fallback 중심이며 실제 운영용 정책 엔진은 아닙니다.
- 음성 전사와 회의 분석은 Evidence Capture 보조 기능이며 자동 결정의 확정 근거가 아닙니다.
