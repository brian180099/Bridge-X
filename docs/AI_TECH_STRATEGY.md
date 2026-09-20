# 문제 해결 구조와 AI 기술 전략

## 1. 우리가 푸는 문제를 기술적으로 다시 정의하면

일반 번역 문제는 입력 문장 `X`를 다른 언어의 문장 `Y`로 바꾸는 문제다. Bridge X가 푸는 문제는 다르다.

```text
같은 요청 X
  ├─ PM의 의도 I
  ├─ UX가 만드는 실행 해석 U
  ├─ 개발자가 만드는 실행 해석 E
  └─ Risk가 만드는 실행 해석 R

목표: I, U, E, R의 차이 중 실제 재작업·규제·일정 위험으로 이어지는 차이를
실행 전에 찾고, 사람이 합의할 수 있는 계약 C로 변환한다.
```

즉, 핵심은 자연어 생성 자체가 아니라 **역할 조건부 의미 추론 + 불일치 탐지 + 구조화된 계약 생성**이다.

## 2. 문제 → 솔루션 → 기술 매핑

| 현장의 문제 | 제품 솔루션 | 사용하는 AI/기술 | 왜 이 방식인가 |
|---|---|---|---|
| “빠르게”, “성과가 좋으면” 같은 모호한 표현 | Meaning Diff | LLM 의미 추론 + category schema | 키워드 검사만으로는 문맥 속 의도와 영향까지 판단하기 어렵다. |
| 같은 문장을 직무마다 다르게 실행 | Role Lens | 역할·도메인 조건을 포함한 structured prompting | 독립 번역이 아니라 동일 원문에 대한 관점별 실행 해석이 필요하다. |
| 결과가 설명 없이 점수로만 제시됨 | Evidence-linked diff | `sourcePhrase`, intent, interpretation, impact 필드 | 사용자가 원문 근거와 위험의 연결을 검토할 수 있어야 한다. |
| AI가 중요한 결정을 임의 확정 | Decision Ledger | human-in-the-loop workflow | 모델은 질문·대안을 제시하고 최종 KPI·규제 예외·승인자는 사람이 확정한다. |
| 문서가 있어도 수신자가 다르게 이해 | Receiver Receipt | 역할별 요약 + 실제 사용자 확인 상태 | ‘보냈다’가 아니라 ‘어떻게 이해했는지’를 기록해야 한다. |
| AI 장애 시 발표와 업무가 중단 | Deterministic fallback | TypeScript rule engine | 네트워크·키·모델 장애에서도 동일한 API 계약으로 데모와 기본 검수를 유지한다. |

## 3. 어떤 AI를 사용했는가

### 현재 구현

- **OpenAI Responses API**: 원본 업무 요청을 한 번의 구조화된 분석으로 처리
- **실제 검증 모델**: 팀 공유 설정의 `LLM_MODEL=gpt-4o`
- **교체 가능 구조**: `OPENAI_MODEL` 또는 `LLM_MODEL`로 모델을 변경하며, 값이 없을 때 기본값은 `gpt-5-mini`
- **Structured Outputs / JSON Schema**: Meaning Diff, Role Lens, Contract, Receipt를 UI가 바로 사용할 수 있는 고정 스키마로 반환
- **Zod 이중 검증**: 모델 출력 JSON을 서버에서 다시 검증해 누락·잘못된 enum·점수 범위를 차단
- **Hybrid fallback**: API 키가 없거나 모델 호출이 실패하면 deterministic engine이 같은 `AnalyzeResponse`를 반환

공식 참고:

- [OpenAI Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

### 왜 여러 에이전트를 실제로 동시에 돌리지 않았는가

현재 프로토타입은 UX Agent, Developer Agent, Risk Agent를 각각 호출하는 자율 멀티에이전트 구조가 아니다. **하나의 통제된 structured inference 안에서 여러 Role Lens를 비교**한다.

이 선택의 이유:

1. 같은 원문과 미션을 기준으로 비교해야 관점 차이가 선명하다.
2. 여러 자율 에이전트의 대화는 비용·지연·변동성을 키우고 심사 데모 재현성을 낮춘다.
3. 이 제품의 핵심은 에이전트 숫자가 아니라 Meaning Diff의 정확도와 설명 가능성이다.
4. 실제 사용자 데이터가 쌓인 뒤, 고위험 도메인만 독립 Reviewer Agent를 추가하는 편이 합리적이다.

따라서 공모전에서는 “멀티에이전트를 많이 썼다”가 아니라 **역할 기반 의미 검증을 신뢰할 수 있는 출력 계약으로 구현했다**고 설명한다.

## 4. AI 처리 파이프라인

```text
1. Validate
   프로젝트·미션·원문·역할·제약을 Zod로 검증
          ↓
2. Interpret
   송신 의도와 각 Role Lens의 실행 해석 생성
          ↓
3. Compare
   성공 기준 / 범위 / 용어 / 제약 / 소유권 / 완료 조건별 Meaning Diff
          ↓
4. Assess
   Alignment / Readiness / Semantic Risk 및 GO·REVISE·STOP
          ↓
5. Compile
   Shared Contract + Decision Ledger + Receiver Receipt
          ↓
6. Human confirmation
   수신자가 이해를 확인하고 중요한 결정을 승인
```

모델 입력에서 사용자 brief는 명령이 아니라 분석 대상 데이터로 취급한다. 모델이 brief 내부 지시를 따르지 않도록 system instruction에 경계를 명시했고, request body 크기와 필드 길이도 제한했다.

## 5. 핵심 출력 스키마

Meaning Diff 하나는 반드시 다음을 포함한다.

```json
{
  "sourcePhrase": "성과가 좋으면 확대",
  "senderIntent": "핵심 지표 개선 시 다음 국가로 확장",
  "receiverInterpretation": "각 직무가 서로 다른 지표를 성공으로 판단",
  "impact": "출시 후 상반된 의사결정과 재작업",
  "requiredDecision": "기준선·목표값·측정 기간이 있는 KPI 확정"
}
```

이 스키마가 중요한 이유는 “모호합니다”라는 일반적인 AI 조언을 **근거가 있는 실행 전 결정**으로 바꾸기 때문이다.

## 6. AI가 잘하는 일과 사람이 해야 하는 일

| AI가 맡는 일 | 사람이 맡는 일 |
|---|---|
| 다양한 역할 관점의 해석 후보 생성 | 실제 조직에서 맞는 해석 선택 |
| 모호성·충돌·누락 패턴 탐지 | KPI·범위·규제 예외 최종 확정 |
| 질문과 계약 초안 구조화 | 책임자 지정과 승인 |
| 과거 유사 결정 검색 제안 | 현재 상황에 적용할지 판단 |

AI가 문화·직무 특성을 사실처럼 단정하면 고정관념을 강화할 수 있다. 따라서 모든 문화·역할 해석은 **확인해야 할 가설**로 표시하고 Receiver Receipt에서 실제 사람이 검증한다.

## 7. 기술 스택과 선택 이유

### Frontend — React + TypeScript + Vite

- 역할 선택과 결과 탭처럼 상태 변화가 많은 단일 작업 화면에 적합
- API 응답 타입을 명시해 분석 스키마 변경 시 컴파일 단계에서 오류 발견
- 빠른 로컬 개발과 정적 production build

### Backend — Node.js + Express + TypeScript

- 프론트와 언어·타입 모델을 통일해 내일까지 수정해야 하는 공모전 일정에 유리
- 얇은 API 계층으로 모델 제공자를 교체하기 쉬움
- Zod로 입력과 AI 출력 모두 런타임 검증

### OpenAI Responses API + Structured Outputs

- 자유문 생성보다 고정 JSON Schema가 제품 UI·평가·저장에 적합
- `meaningDiffs`, `decisions`, `receipts`처럼 필수 키가 있는 결과를 안정적으로 처리
- 향후 file search나 사내 지식 도구 연결로 확장 가능

### 향후 Semantic Memory — PostgreSQL + pgvector

아직 구현되지 않은 다음 단계다. 조직의 과거 결정·용어·규정 조항을 embedding으로 검색하고, LLM 입력에 출처와 함께 제공한다. embedding은 결정을 자동으로 내리는 용도가 아니라 **유사한 과거 근거를 찾는 검색 계층**으로만 사용한다. 다국어 검색 후보로 [OpenAI text-embedding-3-large](https://developers.openai.com/api/docs/models/text-embedding-3-large)를 검토한다.

## 8. 정확도 검증 방법

일반적인 “답변이 좋아 보이는가”가 아니라 실제 handoff 실패를 기준으로 평가한다.

### 평가 데이터셋

- 과거 실제 프로젝트에서 재작업·승인 지연이 발생한 요청서
- 각 요청의 실제 오해 원인과 발견 시점
- PM·UX·개발·Risk 전문가가 작성한 gold Meaning Diff

### 핵심 AI 지표

- `Critical gap recall`: 실제 치명적 충돌 중 사전에 탐지한 비율
- `False alarm rate`: 전문가가 무관하다고 판정한 경고 비율
- `Decision usefulness`: 생성 질문이 실제 결정으로 이어진 비율
- `Role faithfulness`: 해당 역할 전문가가 자신의 관점을 적절히 반영했다고 평가한 점수
- `Contract completeness`: 목표·범위·제약·완료·owner 필수 항목 충족률

### 제품 효과 지표

- 착수 후 요구사항 재질문 수
- 재작업 티켓 수와 시간
- 승인 리드타임
- 첫 실행 성공률

## 9. 현재 한계와 솔직한 설명

- 지금의 Role Lens는 일반적인 직무 패턴을 사용하며 각 회사의 실제 프로세스를 아직 학습하지 않았다.
- Semantic Risk 점수는 보험·신용 점수 같은 객관 확률이 아니라 우선순위 판단용 휴리스틱이다.
- 실제 사용자의 Receiver Receipt가 쌓여야 예측 해석과 실제 해석의 차이를 학습할 수 있다.
- 규제 판단은 법률 자문을 대체하지 않으며 담당자의 검토를 돕는 질문 생성에 한정한다.

이 한계를 감추기보다 공모전에서는 **현재는 검증 가능한 preflight prototype이며, 다음 핵심 데이터 자산은 예측 해석과 실제 receipt의 pair**라고 설명한다.

## 10. 심사위원에게 전달할 기술 한 문장

> Bridge X는 LLM을 단순 번역·요약에 쓰지 않고, 동일한 업무 요청을 여러 직무의 실행 관점으로 조건부 해석한 뒤 그 차이를 구조화된 Meaning Diff와 사람이 승인하는 Shared Contract로 변환합니다.
