# Bridge X

> 말을 번역하는 것을 넘어, **일이 전달되는 방식을 번역합니다.**

Bridge X는 사람·직무·AI 에이전트 사이에서 일이 넘어갈 때 생기는 의미 손실을 실행 전에 발견하는 **Agent Handoff & Context Coordination** 플랫폼입니다. 단순 번역이나 에이전트 연결 대신 `sender intent ≠ receiver interpretation`을 비교하고, 팀이 실제로 합의해야 할 Shared Contract와 Receiver Receipt를 만듭니다.

![Bridge X Spec Preflight](./docs/preview.png)

## 제품 방향

```text
현재 MVP                       확장 플랫폼
Spec Preflight                AI Product War Room
업무 요청의 의미를 사전 검수  여러 에이전트의 근거·제약·결정을 연결
        └──── 공통 기반: Context Handoff Protocol ────┘
```

현재 구현은 모든 AI 에이전트를 만드는 범용 빌더가 아닙니다. 먼저 가장 빈번하고 검증하기 쉬운 **업무 요청의 handoff 순간**을 해결합니다. 이후 같은 Context Handoff 계약을 에이전트 간 산출물, Slack·Notion·Jira·GitHub의 인수인계 지점으로 확장합니다.

## 지금 구현된 프로토타입

- 원본 업무 요청, 미션, 송신·수신 역할, 비협상 제약 입력
- 직무별 Role Lens를 통한 서로 다른 실행 해석 시뮬레이션
- 성공 기준·범위·제약·완료 조건의 `Meaning Diff` 탐지
- Go / Revise / Stop 판정과 Alignment·Readiness·Semantic Risk 점수
- 실행 가능한 `Shared Contract`와 미결정 사항 `Decision Ledger` 생성
- 각 수신 역할의 이해·납품물·부족한 정보가 담긴 `Receiver Receipt`
- OpenAI API 키가 없을 때도 동작하는 로컬 데모 엔진
- API 키가 있으면 OpenAI Responses API의 Structured Outputs를 사용하는 AI 분석

### 분석 모드 구분

| 모드 | Meaning Diff | 용도 |
|---|---|---|
| 체험·데모 | 성공 기준·범위·제약·완료 조건의 표준 4유형 | API 키 없이 안정적인 시연 |
| 실제 AI | 문맥에 따라 이름과 개수가 달라지는 2~8건 | 실제 요청의 도메인·직무별 의미 분석 |

화면의 결과 메타 정보에도 `체험 분석` 또는 `AI 맞춤 분석`과 탐지 건수가 표시됩니다. 따라서 데모의 4유형은 제품 전체의 고정 분류 체계가 아니라, 키 없이 체험할 수 있는 기준 분석 세트입니다.

## 3분 안에 실행하기

필요 환경: Node.js 20 이상

```bash
npm install
copy .env.example .env
npm run dev
```

- Web: http://localhost:5173
- API health: http://localhost:8787/api/health

`.env`의 `OPENAI_API_KEY`가 비어 있으면 데모 분석 엔진이 사용됩니다. 실제 AI Role Lens를 사용하려면 키를 넣고 `AI_MODE=auto`로 두세요. 키는 브라우저에 전달되지 않고 API 서버에서만 사용합니다.

팀 공유 환경변수 형식인 `LLM_PROVIDER=openai`, `LLM_API_KEY`, `LLM_MODEL`도 지원합니다. 실제 키가 담긴 `.env`는 Git과 Vercel 업로드 대상에서 제외됩니다.

## Vercel 배포

저장소 루트에서 Vercel 프로젝트를 연결한 뒤 Production 환경변수에 `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`을 등록하고 배포합니다.

```bash
vercel
vercel --prod
```

프론트엔드는 `public/`로 빌드되고, 루트 `api/`의 엔드포인트가 Vercel Function으로 배포됩니다. 심사 기간에는 배포 URL과 `/api/health`를 함께 확인하세요.

## VS Code에서 작업하기

1. VS Code에서 이 저장소 폴더를 엽니다.
2. 추천 확장을 설치합니다.
3. `Ctrl+Shift+B`를 누르고 **Bridge X: 전체 개발 서버**를 실행합니다.
4. 디버깅 패널에서 **Bridge X Web + API**를 선택하면 두 앱을 함께 디버깅할 수 있습니다.

## 프로젝트 구조

```text
.
├─ apps/
│  ├─ web/                 # React + Vite + TypeScript
│  └─ api/                 # Express + TypeScript + OpenAI optional
├─ api/                    # Vercel Functions 진입점
├─ vercel.json             # Vercel build 설정
├─ docs/
│  ├─ SERVICE_PLAN.md      # 서비스 기획안과 시장 포지셔닝
│  ├─ SUBMISSION_BRIEF.md  # 공모전 폼에 붙여 넣을 제출 문안
│  ├─ AI_TECH_STRATEGY.md  # 문제-솔루션-AI 선택-기술 구현 근거
│  ├─ ARCHITECTURE.md      # 시스템 구조와 API 계약
│  └─ DEMO_SCRIPT.md       # 3분 발표·시연 순서
└─ .vscode/                # VS Code task / debug 설정
```

## 명령어

```bash
npm run dev       # Web + API 동시 실행
npm run dev:web   # 프론트엔드만 실행
npm run dev:api   # 백엔드만 실행
npm run build     # 전체 production build
npm test          # API·분석 엔진 테스트
```

## 제품의 명확한 경계

Bridge X는 또 하나의 범용 멀티에이전트 빌더가 아닙니다. 다른 플랫폼이 “누가 무엇을 실행할지” 연결한다면, Bridge X는 실행 전에 **“보낸 사람·받는 사람·다음 에이전트가 같은 목표와 제약을 이해했는지”** 검증하는 품질 게이트입니다. 첫 진입 제품은 기획서·업무 요청을 검수하는 **Spec Preflight**이며, 검증된 계약을 기반으로 **AI Product War Room**까지 확장합니다.

## 다음 단계

- 팀·프로젝트 로그인과 PostgreSQL 기반 히스토리
- 조직별 용어집, 결정 기록, 역할별 도메인 팩
- Slack / Notion / Jira / GitHub PR 연동
- 실제 수신자가 수정·서명하는 Receiver Receipt
- 재작업률, 승인 리드타임, 의미 충돌 회피 비용 측정

상세한 우선순위와 사업 가설은 [서비스 기획안](./docs/SERVICE_PLAN.md), AI 선택과 구현 근거는 [AI 기술 전략](./docs/AI_TECH_STRATEGY.md)을 확인하세요.
