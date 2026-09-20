# 3분 발표·데모 스크립트

## 0:00–0:30 · 문제

“번역이 정확해도 일은 잘못 전달됩니다. 여기 ‘가입 없이 빠르게 결제하고 성과가 좋으면 확대’라는 요청이 있습니다. PM에게 성과는 전환율이고, UX에게는 이탈률, 개발자에게는 오류 없는 배포, Risk에게는 규제 통과입니다. 같은 문장이 네 개의 다른 프로젝트가 되는 순간입니다.”

화면에서 `Global Checkout v2`의 원본 요청과 UX / Frontend / Risk 역할을 가리킵니다.

## 0:30–1:10 · Preflight 실행

`Preflight 실행`을 누릅니다.

“Bridge X는 번역하거나 요약하는 데서 끝나지 않습니다. 송신 의도와 각 수신 역할이 실제로 실행할 해석을 비교합니다. 결과는 REVISE이고 Semantic Risk는 78입니다.”

상단 handoff map에서 Sender → Meaning Layer → Receivers 흐름을 보여줍니다.

## 1:10–1:50 · Meaning Diff

첫 번째 카드:

“‘성과가 좋으면’이라는 표현을 역할마다 다른 지표로 해석합니다. 그래서 단일 지표, 기준선, 목표값, 측정 기간을 결정하도록 요구합니다.”

세 번째 카드:

“guest checkout은 전환에는 좋지만 국가별 본인확인 의무와 충돌할 수 있습니다. Bridge X는 이를 번역 오류가 아니라 제약 충돌로 잡아냅니다.”

## 1:50–2:25 · Shared Contract

`Shared Contract` 탭을 누릅니다.

“탐지만 하고 끝나지 않습니다. Mission, In/Out scope, 비협상 제약, Definition of Done을 실행 가능한 계약으로 바꾸고, 아직 사람이 확정해야 할 결정과 소유자를 오른쪽 ledger에 남깁니다.”

## 2:25–2:45 · Receiver Receipt

`Receiver Receipts` 탭을 누릅니다.

“마지막으로 각 역할은 자신이 이해한 목표, 납품할 것, 부족한 정보를 회신합니다. 문서를 보냈다는 사실이 아니라 의미를 확인했다는 증거가 남습니다.”

## 2:45–3:00 · 차별점과 확장

“Asana와 에이전트 플랫폼이 누가 무엇을 실행할지 연결한다면, Bridge X는 그 실행 전에 모두가 같은 의미를 이해했는지 검증합니다. 다음 단계는 Slack·Notion·Jira·GitHub의 handoff 지점에 이 품질 게이트를 붙이는 것입니다. Bridge X — 일이 넘어가기 전에 오해를 테스트합니다.”

## 데모 안전 장치

- 발표 전 `npm run dev`를 실행하고 http://localhost:5173을 엽니다.
- API 상태가 `Demo mode`여도 샘플 화면과 fallback은 정상 동작합니다.
- OpenAI 키를 넣었다면 한 번 실행해 응답 시간을 확인하고, 불안정하면 `.env`에서 `AI_MODE=demo`로 고정합니다.
- 브라우저 배율은 80~90%, 화면 폭은 1280px 이상을 권장합니다.
