# Bridge-X Frontend

Bridge-X의 사용자 워크룸과 검토·승인 경험을 담당합니다.

## MVP 화면

1. **Goal Setup** — 목표, 제약 조건, 완료 기준 입력
2. **Agent Workroom** — 역할별 작업 상태와 산출물 확인
3. **Handoff Inspector** — 목적·근거·가정·제약·완료 기준 비교
4. **Conflict Map** — 역할 간 충돌과 누락된 전제 표시
5. **Decision Desk** — 사람의 승인 항목과 `Go / Revise / Stop` 결과

## 핵심 UI 원칙

- 에이전트의 대화량보다 현재 결정에 필요한 정보를 우선한다.
- 사실, 추론, 가정을 시각적으로 구분한다.
- 충돌을 자동으로 덮지 않고 근거와 함께 나란히 보여준다.
- 중요한 실행은 사람의 승인을 거친다.
- 모든 결과에서 원래 목표와 근거로 추적할 수 있어야 한다.

## 기술 스택 제안 — 미확정

기존 BridgeNote 경험을 재사용한다면 React, TypeScript, Vite, Zustand, Tailwind CSS 조합이 유력합니다. MVP 요구사항을 확정한 뒤 최종 선택합니다.
