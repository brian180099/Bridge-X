# Operation AI 제품 공개 체크리스트

> 현재 특정 공모전이나 출품을 준비하는 문서가 아니다. 외부 공개·데모·사용자 검증 전에 실제 구현 상태를 확인하기 위한 체크리스트다.

## 기본 정보

- [x] 서비스명: Operation AI · 오퍼레이션 AI
- [x] 현재 서비스 URL: https://bridge-x-omega.vercel.app
- [x] 현재 GitHub 저장소: https://github.com/brian180099/Bridge-X
- [ ] 새 브랜드에 맞는 도메인과 GitHub 저장소명 결정

## 제품 정합성

- [x] 첫 화면이 프로젝트 목표에서 시작한다.
- [x] Agent Passport, Structured Handoff, Conflict Detection이 보인다.
- [x] Human Approval Gate에서 결정 이유를 필수로 입력한다.
- [x] GO, REVISE, STOP과 Audit Log를 확인할 수 있다.
- [x] 내부 Agent Simulation임을 명시한다.
- [x] MeetingApp은 Evidence Capture 보조 계층으로 설명한다.

## 공개 전 확인

- [ ] 외부 Agent 플랫폼과 실제 연동한 것처럼 표현하지 않는다.
- [ ] in-memory 저장소와 프로토타입 한계를 명시한다.
- [ ] 개인정보·비밀정보를 데모 입력에 사용하지 않는다.
- [ ] `/api/health`, 프로젝트 생성, 실행, 승인, 수정 요청 API를 확인한다.
- [ ] `npm test`와 `npm run build`를 통과한다.
