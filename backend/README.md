# Bridge-X Backend

에이전트 실행과 연결 자체보다 **역할 간 핸드오프 품질, 충돌 탐지, 검증 가능한 실행 기록**을 담당합니다.

## MVP 책임

- 워크스페이스·작업·실행 세션 관리
- 역할별 에이전트 및 외부 모델 어댑터
- 병렬 실행과 제한된 순차 실행
- `Context Handoff` 정규화·검증
- 근거, 가정, 제약, 완료 기준의 누락 탐지
- 역할 간 주장·요구사항 충돌 비교
- 사람 승인 게이트
- 실행 이력, 비용, 오류, 산출물 추적

## Context Handoff 초안

```json
{
  "from_role": "research",
  "to_role": "product",
  "objective": "검증할 업무 목적",
  "deliverable": "전달하는 산출물",
  "evidence": [
    {
      "claim": "주장",
      "source": "출처",
      "confidence": 0.0
    }
  ],
  "facts": [],
  "assumptions": [],
  "constraints": [],
  "open_questions": [],
  "acceptance_criteria": [],
  "human_decisions": []
}
```

## 기술 방향 — 미확정

초기에는 단일 오케스트레이터와 명시적인 상태 모델로 시작하고, 복잡한 자율 에이전트 네트워크는 검증 이후에 확장합니다. 기존 BridgeNote의 Spring 기반 API와 FastAPI AI 계층 경험은 참고하되 Bridge-X 요구사항에 맞춰 다시 결정합니다.
