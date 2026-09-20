# Bridge X 서비스 기획안

## 1. 한 문장 정의

**Bridge X는 직무·도메인·문화권이 다른 구성원과 AI 에이전트 사이에서 업무가 넘어가기 전에 의미 충돌을 발견하고, 모두가 실행할 수 있는 공통 계약으로 바꾸는 Semantic Handoff Assurance 플랫폼이다.**

슬로건: **일이 넘어가기 전에 오해를 테스트합니다.**

## 2. 해결하려는 문제

프로젝트 실패는 정보가 아예 없어서만 생기지 않는다. 같은 문장을 PM, 디자이너, 개발자, 법무가 각자의 목표·용어·위험 기준으로 다르게 해석하기 때문에 생긴다.

예를 들어 “가입 없이 빠르게 결제하고 성과가 좋으면 확대”라는 요청은 다음처럼 갈라진다.

- PM: 결제 전환율이 오르면 성공
- UX: 단계와 인지 부하가 줄면 성공
- 개발: 오류 없이 4주 안에 배포하면 성공
- Risk: 국가별 인증 의무를 충족해야 출시 가능

기존 번역기는 언어를 바꾸고, 업무 도구는 작업을 배정하며, 에이전트 오케스트레이터는 실행 순서를 연결한다. 그러나 **송신자의 의도와 수신자의 예상 해석이 일치하는지 실행 전에 검증하는 계층**은 여전히 약하다.

핵심 문제 문장:

> 프로젝트가 한 역할에서 다음 역할로 넘어갈 때 목표·근거·제약·완료 조건이 손실되어 오류와 재작업이 발생한다.

## 3. 제안 솔루션: Spec Preflight

첫 제품은 모든 협업을 한 번에 대체하지 않는다. 가장 비용이 큰 순간인 **기획·요청이 실행 직무로 넘어가기 직전**을 공략한다.

1. PM이나 의뢰자가 미션, 원본 요청, 대상 역할, 제약을 입력한다.
2. Role Lens가 UX·개발·법무 등 각 역할이 해당 문장을 어떻게 실행 문장으로 바꾸는지 시뮬레이션한다.
3. Meaning Diff가 의도와 해석의 차이를 성공 기준, 범위, 용어, 제약, 소유권, 완료 조건별로 탐지한다.
4. Decision Ledger가 사람이 확정해야 할 질문과 담당자를 남긴다.
5. Shared Contract가 합의된 목표·범위·비협상 조건·완료 조건을 실행 가능한 형태로 만든다.
6. Receiver Receipt가 각 수신 역할이 이해한 내용, 납품할 것, 부족한 정보를 회신하게 한다.

판정은 세 가지다.

- `GO`: 의미 충돌이 낮고 착수 조건이 충족됨
- `REVISE`: 방향은 맞지만 결정·제약·완료 조건의 보완 필요
- `STOP`: 규제·보안·핵심 목표 충돌이 해결되지 않아 실행하면 안 됨

## 4. 누구를 위한가

### 1차 고객

- 글로벌 SaaS·커머스의 Product / Design / Engineering / Risk 팀
- 외주·에이전시와 협업하는 국내 스타트업
- 한국 본사와 해외 지사 사이에서 요구사항을 주고받는 조직

### 첫 구매자와 사용자

- 구매자: Product Ops, PMO, Engineering Manager, COO
- 작성자: PM, 프로젝트 리드, 운영 담당자
- 수신자: 디자이너, 개발자, 데이터, 보안·법무·현지 운영자

## 5. 경쟁 지형과 차별점

시장에는 강한 선행 사례가 이미 있다. 따라서 “직무별 AI 에이전트 플랫폼”만으로 포지셔닝하면 차별성이 약하다.

| 제품/범주 | 이미 잘하는 질문 | Bridge X가 집중할 질문 |
|---|---|---|
| [Relevance AI Workforce](https://relevanceai.com/workforce) | 어떤 전문 에이전트를 연결하고 자동화할까? | 연결 전에 요청 의미가 역할별로 갈라지는가? |
| [Asana Agentic Work Management](https://asana.com/product/ai) | 사람과 에이전트가 같은 계획·컨텍스트에서 누가 무엇을 할까? | 그 계획을 각 역할이 같은 성공·완료 기준으로 이해하는가? |
| [Handover Handoff Continuity Record](https://handover.sh/protocol) | 다음 사람·에이전트가 이어갈 상태를 어떻게 전달할까? | 전달된 상태가 수신자 관점에서 어떻게 다르게 해석될까? |
| [Palantir AIP](https://www.palantir.com/platforms/aip/) | 기업 데이터·행동·권한을 어떤 Ontology로 연결할까? | 일상 업무 문장의 모호성을 가볍고 빠르게 어떻게 검수할까? |
| [ServiceNow AI Control Tower](https://www.servicenow.com/products/ai-control-tower.html) | 여러 AI 자산을 어떻게 발견·통제·감사할까? | 실행 전 의미 품질을 어떻게 보증할까? |

차별화 원칙:

1. **Meaning Diff**: 단순 요약이 아닌 송신 의도와 직무별 예상 해석 비교
2. **Receiver Receipt**: AI가 결론을 확정하지 않고 실제 수신자가 이해를 확인
3. **Decision-linked glossary**: 용어 설명이 아니라 해당 프로젝트의 결정 근거·제약과 연결
4. **Pre-execution gate**: 실행 추적이나 사후 평가가 아니라 재작업이 생기기 전 차단
5. **Cultural layer is a lens, not the product**: 언어·문화 번역은 Role Lens 중 하나이며 중심 가치는 업무 의미 보존

포지셔닝 문장:

> Existing tools move context. Bridge X verifies meaning.

## 6. 핵심 화면과 사용자 여정

### A. Spec Preflight

- 요청서/PRD 붙여넣기
- 송신자와 수신 역할 선택
- 비협상 제약과 일정 입력
- Meaning Diff와 위험 점수 확인

### B. Shared Contract

- Mission / Scope / Out of scope
- Non-negotiables
- Acceptance criteria / Definition of Done
- Decision owner / Due / Evidence

### C. Receiver Receipt

- “내가 이해한 목표”
- “내가 납품할 것”
- “아직 부족한 정보”
- 신뢰도와 승인

### D. Semantic Memory — 후속 단계

- 조직 용어집
- 결정과 변경 이유
- 역할·국가·도메인별 선호 규칙
- 반복되는 충돌 패턴과 개선 지표

## 7. MVP 범위

### 현재 프로토타입에 포함

- 한 개 handoff 요청에 대한 분석
- PM → UX / FE / Risk 예시
- 데모 모드: 성공 기준·범위·제약·완료 조건의 표준 4유형 Meaning Diff
- 실제 AI 모드: 입력 문맥에 따라 카테고리와 개수가 달라지는 2~8건의 Meaning Diff
- 역할별 Role Lens
- Shared Contract, Decision Ledger, Receiver Receipt
- OpenAI API 선택 연동과 로컬 fallback

### 공모전 이후 4주

- 사용자·워크스페이스·프로젝트 저장
- 분석 이력과 수정 전/후 diff
- 사용자 정의 역할·도메인 팩
- Receiver Receipt 실제 승인 링크
- 결과 Markdown / PDF export

### 8~12주

- Slack·Notion·Jira·GitHub 연동
- 댓글과 요구사항 변경 시 자동 재검사
- 조직별 Semantic Risk benchmark
- 한국어↔영어·일본어 문화·도메인 lens

## 8. 성공 지표

North Star: **Bridge X 검수를 통과한 handoff 중 재질문 없이 첫 실행에 들어간 비율**

보조 지표:

- 요청 작성부터 수신 확인까지 걸리는 시간
- 착수 후 요구사항 변경·재작업 건수
- handoff당 발견된 critical/high Meaning Diff 수
- Decision Ledger의 착수 전 해결률
- 송신자와 수신자의 목표 이해 일치 점수

검증 실험:

1. 5개 팀에서 과거 재작업이 컸던 PRD 20건을 입력한다.
2. 실제 발생했던 오해 중 Bridge X가 사전에 탐지한 비율을 측정한다.
3. 새 요청 10건을 A/B로 나누어 재질문 수와 착수 시간을 비교한다.

## 9. 수익 모델 가설

- Free: 월 10회 preflight, 기본 역할 3개, 로컬 history
- Team: 사용자당 월 구독, 무제한 project, custom role pack, 승인 workflow
- Enterprise: SSO, audit, data residency, private model, 조직 ontology·규정 pack
- Marketplace: 결제·의료·채용·게임 등 전문가 검수 기반 domain pack

초기에는 좌석 수보다 **검수되는 handoff 수와 통합 채널 수**가 가치에 더 가깝다. 가격 실험은 팀 구독과 usage 기반을 병행한다.

## 10. 제품 원칙

- AI는 오해 가능성을 제안하고, 중요한 결정은 사람이 확정한다.
- 모든 판정은 원문, 근거, 수신 역할, 필요한 결정으로 추적 가능해야 한다.
- 문화 차이를 고정관념으로 단정하지 않고 확인이 필요한 가설로 표시한다.
- 조직의 실제 결정 기록을 우선하고 일반적인 역할 상식은 보조로 사용한다.
- 자동 실행보다 잘못된 실행을 막는 것이 먼저다.
