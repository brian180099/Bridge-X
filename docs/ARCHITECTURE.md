# Architecture

## 현재 구조

```text
Browser · React/Vite
  │
  │ POST /api/analyze
  ▼
Express API
  ├─ Zod request validation
  ├─ AI_MODE=demo or no key ──> Deterministic role-aware engine
  └─ OPENAI_API_KEY present ──> OpenAI Responses API
                                  └─ Structured JSON schema
  │
  ▼
Meaning Diff + Role Lenses + Shared Contract + Receiver Receipts
```

키가 없거나 AI 호출이 실패해도 deterministic engine으로 같은 응답 계약을 반환하므로 심사 데모가 중단되지 않습니다. `generationMode` 필드로 `ai`, `deterministic`, `deterministic-fallback`을 구분합니다.

## API

### `GET /api/health`

서버 상태와 AI 사용 가능 여부를 반환합니다.

### `GET /api/examples/global-product-handoff`

Global Checkout 샘플 입력과 분석 결과를 반환합니다.

### `POST /api/analyze`

Request:

```json
{
  "projectName": "Global Checkout v2",
  "mission": "해외 결제 전환율을 높이되 국가별 규제를 충족한다.",
  "sourceRole": "Product Manager",
  "targetRoles": ["UX Designer", "Frontend Engineer", "Risk & Compliance"],
  "brief": "원본 업무 요청...",
  "constraints": ["4주 내 베타", "WCAG 2.2 AA"]
}
```

Response 핵심 필드:

- `verdict`: GO / REVISE / STOP
- `scores`: alignment / readiness / semanticRisk
- `meaningDiffs`: sourcePhrase, senderIntent, receiverInterpretation, impact, requiredDecision
- `roleLenses`: 역할별 focus, interpretation, needs, hiddenRisk
- `sharedContract`: 실행 계약 섹션
- `decisions`: 사람이 확정할 질문과 owner
- `receiverReceipts`: 수신자의 이해·산출물·부족 정보

## 데이터 모델 — 다음 단계

```text
Workspace
 ├─ Members
 ├─ RoleProfiles
 ├─ DomainPacks
 └─ Projects
     ├─ SourceBriefs
     ├─ Analyses
     │   ├─ MeaningDiffs
     │   ├─ Decisions
     │   └─ SharedContractVersions
     └─ ReceiverReceipts
```

PostgreSQL을 기준으로 versioned contract와 decision provenance를 저장하고, pgvector는 과거 유사 결정과 조직 용어를 검색하는 보조 계층으로만 사용합니다. 검색 결과는 자동 확정하지 않고 출처와 함께 제안합니다.

## 보안·AI 안전 원칙

- OpenAI 키는 API 서버 환경 변수에만 보관
- request body 64KB 제한과 Zod 스키마 검증
- 사용자 brief는 지시가 아니라 분석 대상 데이터로 처리
- Structured Outputs 결과도 런타임 스키마로 다시 검증
- AI 장애 시 사용자 입력을 잃지 않고 deterministic 분석으로 fallback
- 중요한 결정과 승인은 항상 human-in-the-loop

## 프로덕션 전환 체크리스트

- 인증·워크스페이스 권한과 tenant isolation
- 요청별 rate limiting과 abuse monitoring
- PII 탐지·마스킹과 보존 정책
- 모델·프롬프트 버전과 분석 provenance 저장
- eval dataset: 실제 handoff 오해 사례, 탐지 recall, false positive
- 팀별 승인 정책과 감사 로그
- OpenTelemetry tracing과 비용·지연 모니터링
