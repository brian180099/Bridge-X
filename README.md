# Bridge X

Bridge X는 **Agent Handoff & Context Coordination**을 검증하는 프로토타입입니다. 서로 다른 전문 AI Agent가 하나의 프로젝트를 수행할 때 업무·권한·맥락·근거·제약·완료 조건을 구조화하고, 결과 충돌을 검사한 뒤 중요한 변경은 사람의 **Human Approval Gate**를 거쳐 다음 Agent로 전달합니다.

현재 실행 범위는 실제 외부 Agent 플랫폼 연동이 아닌 **내부 Agent Simulation**입니다. 데이터 저장은 데모 세션용 in-memory 저장소이며, 상용 서비스나 영속적인 팀 협업 저장소로 설명하지 않습니다.

## 핵심 흐름

프로젝트 목표 → Agent Passport → Manager Agent 업무 분배 → 전문 Agent 실행 → **Structured Handoff** → **Conflict Detection**·권한 검사 → **Human Approval Gate** → Decision Context 전달 → 다음 Agent 실행 → **Audit Log**

## 실행

```bash
npm install
npm run dev
```

웹은 `5173`, API는 `8787`에서 실행됩니다. `npm test`는 API 단위·계약 테스트를, `npm run build`는 API TypeScript와 웹 번들을 검사합니다.

## 보조 입력 계층

기존 `MeetingApp`의 녹음·전사·회의 분석 기능은 유지됩니다. 이 기능은 Bridge X의 핵심 CTA가 아니라 **Evidence Capture**로, 회의에서 확보한 원문과 결정사항을 Handoff evidence에 연결하기 위한 선택적 입력 계층입니다.

## 현재 한계

- 외부 Agent 실행·인증·권한 시스템과 실제 연동하지 않습니다.
- 데모 API는 in-memory라 재시작하면 세션이 사라집니다.
- 규칙 기반 Conflict Detection과 deterministic fallback 중심이며, 실제 운영용 정책 엔진은 아닙니다.
- 음성 전사와 회의 분석은 입력 보조 기능이며 자동 결정의 근거로 확정되지 않습니다.
