import { randomUUID } from "node:crypto";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  DecisionItem,
  MeaningDiff,
  ReceiverReceipt,
  RoleLens,
} from "./types.js";

const vagueTerms = [
  "빠르게",
  "최대한",
  "적당히",
  "성과가 좋으면",
  "유연하게",
  "우선",
  "가능한 한",
  "나중에",
  "원활하게",
];

const roleProfiles: Record<string, { focus: string; need: string; risk: string }> = {
  product: {
    focus: "사업 목표, 범위, 우선순위와 성공 지표",
    need: "단일 North Star 지표와 출시 후 판단 기준",
    risk: "성공의 정의가 없으면 MVP 범위가 계속 팽창합니다.",
  },
  ux: {
    focus: "사용자 흐름, 접근성, 예외 상황과 신뢰",
    need: "핵심 사용자군과 필수 상태별 UX 시나리오",
    risk: "정상 흐름만 정의하면 실패·복구 경험이 뒤늦게 발견됩니다.",
  },
  design: {
    focus: "사용자 흐름, 접근성, 예외 상황과 신뢰",
    need: "핵심 사용자군과 필수 상태별 UX 시나리오",
    risk: "정상 흐름만 정의하면 실패·복구 경험이 뒤늦게 발견됩니다.",
  },
  frontend: {
    focus: "인터페이스 계약, 상태, 에러 처리와 테스트 가능성",
    need: "API 계약, 완료 조건, 로딩·오류·빈 상태 정의",
    risk: "‘빠른 구현’이 예외 처리 생략으로 해석될 수 있습니다.",
  },
  engineer: {
    focus: "의존성, 인터페이스 계약, 성능과 운영 가능성",
    need: "수용 기준, 데이터 계약, 책임 경계",
    risk: "소유권과 비기능 요구가 없으면 통합 시점에 일정이 무너집니다.",
  },
  risk: {
    focus: "법적 근거, 개인정보, 감사 가능성과 통제",
    need: "수집 데이터, 보존 기간, 국가별 필수 검토 항목",
    risk: "게스트 흐름과 최소 수집 원칙이 인증 의무와 충돌할 수 있습니다.",
  },
  compliance: {
    focus: "법적 근거, 개인정보, 감사 가능성과 통제",
    need: "수집 데이터, 보존 기간, 국가별 필수 검토 항목",
    risk: "게스트 흐름과 최소 수집 원칙이 인증 의무와 충돌할 수 있습니다.",
  },
  marketing: {
    focus: "고객 메시지, 세그먼트, 채널과 측정",
    need: "대상 고객, 핵심 약속, 캠페인 성공 기준",
    risk: "제품 목표와 고객에게 약속하는 표현이 달라질 수 있습니다.",
  },
  sales: {
    focus: "고객 가치, 도입 장애물, 약속 가능한 범위",
    need: "ICP, 반론 처리, 기능 약속의 승인 경계",
    risk: "로드맵이 확정 기능으로 전달될 가능성이 있습니다.",
  },
};

function profileFor(role: string) {
  const normalized = role.toLowerCase();
  const key = Object.keys(roleProfiles).find((candidate) => normalized.includes(candidate));
  return key
    ? roleProfiles[key]
    : {
        focus: "자신의 실행 범위, 입력물과 완료 조건",
        need: "산출물 형식, 의사결정권자, 완료 기준",
        risk: "역할별 책임 경계가 달라 중복 작업이나 누락이 생길 수 있습니다.",
      };
}

function shortQuote(text: string, fallback: string) {
  const sentence = text.split(/[.!?。\n]/).map((item) => item.trim()).find(Boolean);
  return (sentence ?? fallback).slice(0, 90);
}

export function analyzeDeterministically(
  input: AnalyzeRequest,
  generationMode: AnalyzeResponse["generationMode"] = "deterministic",
): AnalyzeResponse {
  const detectedVague = vagueTerms.filter((term) => input.brief.includes(term));
  const constraintText = input.constraints.join(" · ") || "명시된 제약 없음";
  const metricIsExplicit = /\d+%|전환율|실패율|NPS|MAU|DAU|KPI/i.test(input.brief);
  const deadlineIsExplicit = /\d+\s*(주|일|개월)|\d{4}[-./]\d{1,2}/.test(
    `${input.brief} ${constraintText}`,
  );

  const meaningDiffs: MeaningDiff[] = [
    {
      id: "MD-01",
      severity: "high",
      category: "성공 기준",
      sourcePhrase: detectedVague[0] ?? shortQuote(input.brief, "성과가 확인되면 확대"),
      senderIntent: "핵심 지표가 개선될 경우 다음 범위로 확장한다.",
      receiverInterpretation:
        "직무마다 전환율, 출시 속도, 품질, 규제 통과 중 서로 다른 지표를 성공으로 간주할 수 있습니다.",
      impact: "출시 이후 상반된 데이터로 같은 결과를 다르게 판정합니다.",
      requiredDecision: "1차 성공 지표, 기준선, 목표값, 측정 기간을 하나의 문장으로 확정하세요.",
    },
    {
      id: "MD-02",
      severity: "high",
      category: "범위와 우선순위",
      sourcePhrase: detectedVague[1] ?? "국가별 기능을 우선 적용",
      senderIntent: "가장 효과가 큰 범위부터 제한적으로 출시한다.",
      receiverInterpretation:
        "‘우선’이 화면 노출 순서인지, 개발 순서인지, 국가별 필수 범위인지 해석이 갈립니다.",
      impact: "디자인·개발·운영의 작업 순서가 달라져 통합 직전에 재작업합니다.",
      requiredDecision: "In scope / Out of scope와 국가·사용자·기능 우선순위를 분리해 적으세요.",
    },
    {
      id: "MD-03",
      severity: input.targetRoles.some((role) => /risk|compliance|legal|보안|법무/i.test(role))
        ? "critical"
        : "medium",
      category: "제약 충돌",
      sourcePhrase: constraintText.slice(0, 100),
      senderIntent: "속도는 지키되 필수 품질과 규제 기준을 만족한다.",
      receiverInterpretation:
        "일정 압박이 접근성·보안·규제 검토보다 높은 우선순위로 받아들여질 수 있습니다.",
      impact: "출시 승인 지연 또는 출시 후 규제·품질 리스크가 발생합니다.",
      requiredDecision: "일정이 밀릴 때도 양보할 수 없는 비협상 제약과 승인자를 지정하세요.",
    },
    {
      id: "MD-04",
      severity: "medium",
      category: "완료·인수인계",
      sourcePhrase: "완료 조건과 최종 승인자",
      senderIntent: "각 역할이 자신의 산출물을 끝내고 다음 역할로 안전하게 넘긴다.",
      receiverInterpretation:
        "작성 완료, 리뷰 완료, 배포 가능 중 어느 상태가 handoff 완료인지 알 수 없습니다.",
      impact: "대기 시간과 책임 공백이 생기고 ‘나는 끝냈다’는 상태가 반복됩니다.",
      requiredDecision: "역할별 산출물, 검수 증거, 승인자, 다음 행동을 Receiver Receipt로 확정하세요.",
    },
  ];

  const roleLenses: RoleLens[] = input.targetRoles.map((role) => {
    const profile = profileFor(role);
    return {
      role,
      focus: profile.focus,
      interpretation: `${role}은(는) 이 요청을 ‘${input.mission}’을 자신의 책임 범위 안에서 실행하는 과제로 해석합니다.`,
      needs: [profile.need, "변경 시 다시 합의해야 하는 결정과 승인자"],
      hiddenRisk: profile.risk,
    };
  });

  const decisions: DecisionItem[] = [
    {
      id: "D-01",
      question: metricIsExplicit
        ? "명시된 지표의 기준선·목표값·측정 기간을 확정할까요?"
        : "성공을 판단할 단일 핵심 지표와 목표값은 무엇인가요?",
      owner: input.sourceRole,
      due: "개발 착수 전",
      status: "open",
    },
    {
      id: "D-02",
      question: "MVP에서 제외할 기능과 예외 상황을 명시할까요?",
      owner: input.sourceRole,
      due: "범위 리뷰",
      status: "proposed",
    },
    {
      id: "D-03",
      question: "비협상 제약을 최종 승인하는 역할은 누구인가요?",
      owner: input.targetRoles[input.targetRoles.length - 1] ?? input.sourceRole,
      due: "출시 승인 전",
      status: "open",
    },
  ];

  const receiverReceipts: ReceiverReceipt[] = input.targetRoles.map((role, index) => {
    const profile = profileFor(role);
    return {
      role,
      understood: `${input.mission}을 위해 ${profile.focus} 관점의 실행안을 만든다.`,
      willDeliver: `${profile.need}을 포함한 검토 가능한 산출물`,
      missing: index === 0 ? decisions[0].question : decisions[Math.min(index, decisions.length - 1)].question,
      confidence: Math.max(55, 78 - index * 4 - detectedVague.length * 2),
    };
  });

  const risk = Math.min(92, 54 + detectedVague.length * 5 + (metricIsExplicit ? -4 : 8));
  const readiness = Math.max(34, 72 - meaningDiffs.length * 5 + (deadlineIsExplicit ? 5 : -3));
  const alignment = Math.max(42, 82 - detectedVague.length * 4 - input.targetRoles.length * 2);

  return {
    analysisId: randomUUID(),
    generatedAt: new Date().toISOString(),
    generationMode,
    verdict: risk >= 82 ? "STOP" : risk >= 48 ? "REVISE" : "GO",
    summary: `${input.projectName} 요청은 목표 방향은 공유되지만, 성공 기준·범위·제약의 우선순위·인수인계 완료 조건을 실행 전에 합의해야 합니다.`,
    scores: { alignment, readiness, semanticRisk: risk },
    meaningDiffs,
    roleLenses,
    sharedContract: [
      {
        title: "01 · Mission",
        items: [input.mission, `요청 소유자: ${input.sourceRole}`],
      },
      {
        title: "02 · Scope",
        items: [
          `대상 역할: ${input.targetRoles.join(", ")}`,
          "In: 핵심 사용자 흐름, 필수 예외 상태, 측정 이벤트",
          "Out: 성공 기준을 통과하기 전의 2차 확장 기능",
        ],
      },
      {
        title: "03 · Non-negotiables",
        items: input.constraints.length
          ? input.constraints
          : ["법무·보안·접근성 등 필수 제약을 착수 전에 지정"],
      },
      {
        title: "04 · Definition of Done",
        items: [
          "핵심 흐름과 실패·복구 흐름이 수용 기준을 통과한다.",
          "각 역할이 Receiver Receipt를 확인하고 남은 질문의 소유자가 지정된다.",
          "성공 지표의 기준선·목표값·측정 기간이 문서화된다.",
        ],
      },
      {
        title: "05 · Handoff Protocol",
        items: [
          "산출물 링크 + 결정 근거 + 미해결 질문 + 다음 행동을 함께 전달한다.",
          "수신자는 ‘이해한 목표 / 납품할 것 / 부족한 정보’를 회신한다.",
        ],
      },
    ],
    decisions,
    receiverReceipts,
  };
}
