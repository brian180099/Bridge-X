# AI 공모전 제출 폼용 문안

아래 문장은 제출 폼 글자 수에 맞춰 그대로 줄이거나 붙여 넣을 수 있도록 작성했습니다.

## 서비스명

**Bridge X — Semantic Handoff Assurance Platform**

## 한 줄 소개

직무와 문화권이 다른 사람·AI 에이전트 사이에서 업무가 넘어가기 전, 서로 다른 해석을 발견하고 실행 가능한 공통 계약으로 바꾸는 협업 플랫폼입니다.

## 문제 정의

팀의 요청은 번역되어도 의미까지 동일하게 전달되지는 않습니다. “빠르게”, “성과가 좋으면”, “우선 적용” 같은 표현은 PM·디자이너·개발자·법무가 각자의 KPI와 위험 기준으로 다르게 해석합니다. 이 차이는 실행 후에야 드러나 범위 변경, 승인 지연, 재개발과 책임 공백을 만듭니다. 기존 업무 관리 도구는 작업을 배정하고, 번역 AI는 언어를 바꾸며, 멀티에이전트 플랫폼은 실행을 연결하지만, **보낸 의도와 받는 해석이 같은지 실행 전에 검사하는 계층**은 부족합니다.

## 해결 방법

Bridge X의 첫 기능 `Spec Preflight`는 원본 요청을 여러 직무의 Role Lens로 해석하고, 송신자의 의도와 수신자의 예상 실행 해석을 `Meaning Diff`로 비교합니다. 시스템은 성공 기준·범위·용어·제약·완료 조건의 충돌을 표시하고 Go/Revise/Stop을 판정합니다. 이후 사람이 확정해야 할 질문을 Decision Ledger로 정리하고, 모든 역할이 실행할 수 있는 Shared Contract를 생성합니다. 마지막으로 수신자가 “이해한 목표 / 납품할 것 / 부족한 정보”를 Receiver Receipt로 확인합니다.

## 핵심 기능

1. 직무·도메인별 Role Lens
2. Sender Intent vs Receiver Interpretation Meaning Diff
3. Semantic Risk / Alignment / Readiness 점수
4. 실행 가능한 Shared Contract와 Decision Ledger
5. 사람의 확인을 남기는 Receiver Receipt
6. 향후 Slack·Notion·Jira·GitHub handoff 지점 자동 연동

## 차별성

다른 에이전트 플랫폼의 핵심 질문이 “어떤 에이전트가 어떤 일을 실행할까?”라면 Bridge X의 질문은 **“실행 전에 모두가 같은 의미를 이해했는가?”**입니다. Bridge X는 컨텍스트를 옮기는 데서 끝나지 않고, 역할별 해석 차이를 가시화하고 수신 확인을 통해 의미를 검증합니다. 문화 번역은 독립 제품이 아니라 국가·언어별 Role Lens로 포함되므로 번역 AI와 직접 경쟁하지 않습니다.

## 타깃 사용자

글로벌 서비스나 규제 산업에서 Product, Design, Engineering, Risk가 함께 일하는 팀과 외주·해외 지사에 요구사항을 전달하는 스타트업입니다. 초기 구매자는 Product Ops, PMO, Engineering Manager이며 실제 사용자는 요청을 작성하는 PM과 이를 받는 실행 직무입니다.

## 기술 구성

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript, Zod
- AI: OpenAI Responses API Structured Outputs 기반 Role Lens 분석
- Safety: API key 서버 보관, 입력 스키마 검증, 모델 실패 시 deterministic fallback
- 확장 예정: PostgreSQL/pgvector, 조직별 semantic memory, Slack/Notion/Jira/GitHub integration

## AI를 사용한 이유와 방식

이 문제는 단순 키워드 탐지로 풀기 어렵습니다. 같은 “빠르게”도 일정, 고객 경험, 규제 맥락에 따라 위험이 달라지기 때문입니다. OpenAI Responses API를 사용해 동일한 원문을 여러 직무 관점으로 조건부 해석하고, Structured Outputs로 `원문 근거 → 송신 의도 → 수신 해석 → 영향 → 필요한 결정`을 고정 스키마로 생성합니다. 결과는 Zod로 다시 검증하며, AI가 최종 결정을 내리지 않고 Decision Ledger와 Receiver Receipt를 통해 사람이 확정합니다. API 장애 시에는 규칙 기반 엔진으로 동일한 출력 계약을 유지합니다.

상세 구현 근거와 평가 계획: [AI 기술 전략](./AI_TECH_STRATEGY.md)

## 구현 현황

현재 동작하는 웹 프로토타입에서 업무 요청과 직무를 선택하면 Meaning Diff, 역할별 해석, 위험 점수, Shared Contract, Decision Ledger, Receiver Receipt를 확인할 수 있습니다. API 키 없이도 심사용 샘플이 완전히 동작하며, 키를 설정하면 실제 AI 분석 모드로 전환됩니다.

## 기대 효과

- 착수 전 질문을 구조화해 요구사항 재작업 감소
- 서로 다른 KPI·규제·완료 조건의 충돌 조기 발견
- 글로벌·다직무 협업의 승인 리드타임 단축
- 사람과 AI 에이전트가 함께 일할 때 책임과 결정 근거 유지

## 비즈니스 모델

무료 체험 후 팀 단위 SaaS 구독을 제공하고, Enterprise에는 SSO·감사 로그·private model·조직 ontology를 제공합니다. 결제·의료·채용처럼 전문 용어와 규제가 중요한 산업은 검수된 domain pack을 추가 판매합니다.

## 300자 압축본

Bridge X는 PM·디자인·개발·법무처럼 서로 다른 직무가 같은 업무 문장을 다르게 해석해 생기는 재작업을 줄이는 Semantic Handoff Assurance 플랫폼입니다. 원본 요청을 역할별로 해석해 Sender Intent와 Receiver Interpretation의 Meaning Diff를 찾고, Go/Revise/Stop 판정, Shared Contract, Decision Ledger, Receiver Receipt를 생성합니다. 번역이나 범용 에이전트 실행이 아니라 “일이 넘어가기 전에 오해를 테스트”하는 것이 차별점입니다.

## 30초 피치

“번역이 정확해도 일은 잘못 전달될 수 있습니다. ‘빠르게 출시하고 성과가 좋으면 확대’라는 말은 PM, 개발자, 법무에게 전혀 다른 실행 문장입니다. Bridge X는 업무가 다음 직무로 넘어가기 전에 각 역할의 해석을 시뮬레이션하고, 의도와 해석의 차이를 Meaning Diff로 보여줍니다. 그리고 사람이 결정할 질문, 공통 완료 조건, 수신 확인을 하나의 Shared Contract로 만듭니다. 우리는 에이전트를 더 연결하는 플랫폼이 아니라, 사람과 에이전트가 잘못된 의미로 실행하지 않게 하는 품질 게이트를 만듭니다.”
