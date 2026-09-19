import type { AnalyzeRequest, AnalyzeResponse } from "./types";

export const sampleRequest: AnalyzeRequest = {
  projectName: "Global Checkout v2",
  mission: "해외 결제 전환율을 높이되 국가별 규제와 접근성 요구를 충족한다.",
  sourceRole: "Product Manager",
  targetRoles: ["UX Designer", "Frontend Engineer", "Risk & Compliance"],
  brief:
    "결제 실패율을 낮추기 위해 국가별 결제수단을 우선 노출하고, 가입 없이 빠르게 결제할 수 있게 해주세요. MVP라 가능한 한 빨리 출시하고 성과가 좋으면 확대합니다.",
  constraints: ["한국·일본 1차 출시", "4주 내 베타", "WCAG 2.2 AA", "개인정보 최소 수집"],
};

export const sampleAnalysis: AnalyzeResponse = {
  analysisId: "demo-global-checkout",
  generatedAt: new Date().toISOString(),
  generationMode: "deterministic",
  verdict: "REVISE",
  summary:
    "목표 방향은 공유되지만, 성공 기준·우선순위·규제 제약·인수인계 완료 조건이 직무마다 다르게 해석될 가능성이 높습니다.",
  scores: { alignment: 64, readiness: 51, semanticRisk: 78 },
  meaningDiffs: [
    {
      id: "MD-01",
      severity: "high",
      category: "성공 기준",
      sourcePhrase: "성과가 좋으면 확대",
      senderIntent: "핵심 지표가 개선될 경우 다음 국가와 결제수단으로 확장한다.",
      receiverInterpretation:
        "PM은 전환율, UX는 이탈률, 개발은 오류율, Risk는 규제 통과를 각각 성공으로 판단할 수 있습니다.",
      impact: "출시 이후 같은 결과를 두고 상반된 의사결정이 내려집니다.",
      requiredDecision: "기준선, 목표값, 측정 기간이 포함된 단일 North Star 지표를 확정하세요.",
    },
    {
      id: "MD-02",
      severity: "high",
      category: "범위와 우선순위",
      sourcePhrase: "국가별 결제수단을 우선 노출",
      senderIntent: "국가별 사용 비중이 높은 결제수단부터 보여준다.",
      receiverInterpretation:
        "‘우선’이 화면 순서인지, 개발 순서인지, 1차 출시 범위인지 해석이 갈립니다.",
      impact: "디자인·개발 백로그 순서가 달라져 통합 시점에 재작업합니다.",
      requiredDecision: "국가별 Top 3 결제수단과 노출·개발 우선순위를 분리해 확정하세요.",
    },
    {
      id: "MD-03",
      severity: "critical",
      category: "제약 충돌",
      sourcePhrase: "가입 없이 빠르게 결제",
      senderIntent: "계정 생성 마찰을 제거해 결제 완료율을 높인다.",
      receiverInterpretation:
        "Risk는 국가·결제수단별 본인확인 의무가 guest checkout과 충돌할 수 있다고 봅니다.",
      impact: "출시 승인 지연 또는 개인정보·결제 규제 위반 위험이 생깁니다.",
      requiredDecision: "국가별 필수 인증과 선택 인증을 구분하고 Risk 승인 지점을 지정하세요.",
    },
    {
      id: "MD-04",
      severity: "medium",
      category: "완료·인수인계",
      sourcePhrase: "가능한 한 빨리 출시",
      senderIntent: "4주 안에 학습 가능한 최소 범위를 배포한다.",
      receiverInterpretation:
        "디자인 완료, 개발 완료, 규제 승인 중 어느 상태를 ‘출시 가능’으로 볼지 불명확합니다.",
      impact: "역할 사이에 대기 시간과 책임 공백이 생깁니다.",
      requiredDecision: "역할별 산출물·증거·승인자를 Definition of Done으로 합의하세요.",
    },
  ],
  roleLenses: [
    {
      role: "UX Designer",
      focus: "마찰 없는 흐름, 접근성, 실패 후 복구 경험",
      interpretation: "국가별 선호 수단이 먼저 보이고 계정 생성 없이 완료되는 흐름을 설계합니다.",
      needs: ["국가별 핵심 사용자", "결제 실패·재시도 상태", "WCAG 검수 기준"],
      hiddenRisk: "정상 흐름만 설계하면 실패 이후 신뢰 회복 경험이 누락됩니다.",
    },
    {
      role: "Frontend Engineer",
      focus: "API 계약, 상태 모델, 오류 처리와 측정 이벤트",
      interpretation: "국가 신호에 따라 결제수단을 정렬하고 guest flow를 구현합니다.",
      needs: ["결제수단별 API 계약", "국가 판별 우선순위", "수용 테스트"],
      hiddenRisk: "‘빠르게’가 오류·접근성 상태 생략으로 해석될 수 있습니다.",
    },
    {
      role: "Risk & Compliance",
      focus: "KYC, 개인정보 최소 수집, 감사 가능한 승인",
      interpretation: "guest checkout 허용 범위를 국가·결제수단별로 검토합니다.",
      needs: ["수집 데이터 목록", "보존 기간", "국가별 인증 의무"],
      hiddenRisk: "guest checkout과 필수 본인확인 의무가 충돌할 수 있습니다.",
    },
  ],
  sharedContract: [
    {
      title: "01 · Mission",
      items: [
        "한국·일본 결제 사용자의 완료율을 높이면서 국가별 필수 인증과 WCAG 2.2 AA를 충족한다.",
        "요청 소유자: Product Manager",
      ],
    },
    {
      title: "02 · Scope",
      items: [
        "In: 국가별 Top 3 결제수단, guest checkout, 실패·재시도 흐름, 측정 이벤트",
        "Out: 2차 국가, loyalty, saved payment, 개인화 추천",
      ],
    },
    {
      title: "03 · Non-negotiables",
      items: ["한국·일본 1차 출시", "4주 내 베타", "WCAG 2.2 AA", "개인정보 최소 수집"],
    },
    {
      title: "04 · Definition of Done",
      items: [
        "결제 완료율 +8%, 결제 실패율 -15%를 2주간 관측한다.",
        "정상·실패·재시도·인증 필요 상태가 수용 테스트를 통과한다.",
        "UX·FE·Risk가 Receiver Receipt를 승인한다.",
      ],
    },
  ],
  decisions: [
    {
      id: "D-01",
      question: "성공 지표를 결제 완료율 +8%로 확정할까요?",
      owner: "Product Manager",
      due: "개발 착수 전",
      status: "open",
    },
    {
      id: "D-02",
      question: "MVP 국가별 Top 3 결제수단 목록을 고정할까요?",
      owner: "Product Manager",
      due: "범위 리뷰",
      status: "proposed",
    },
    {
      id: "D-03",
      question: "guest checkout의 국가별 KYC 예외를 승인할까요?",
      owner: "Risk & Compliance",
      due: "개발 착수 전",
      status: "open",
    },
  ],
  receiverReceipts: [
    {
      role: "UX Designer",
      understood: "마찰을 줄이되 접근성과 실패 복구를 동일한 완료 조건으로 본다.",
      willDeliver: "핵심·실패·재시도 flow와 접근성 검수표",
      missing: "국가별 결제수단 Top 3 확정",
      confidence: 76,
    },
    {
      role: "Frontend Engineer",
      understood: "국가 기반 정렬과 guest flow를 측정 가능한 상태 모델로 구현한다.",
      willDeliver: "결제 UI, 상태 처리, analytics event",
      missing: "API 오류 코드와 인증 분기 계약",
      confidence: 68,
    },
    {
      role: "Risk & Compliance",
      understood: "국가별 필수 인증을 지키며 수집 데이터를 최소화한다.",
      willDeliver: "국가별 KYC matrix와 출시 승인 기록",
      missing: "결제 파트너별 데이터 보존 정책",
      confidence: 61,
    },
  ],
};
