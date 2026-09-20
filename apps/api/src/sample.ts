import type { AnalyzeRequest } from "./types.js";

export const sampleRequest: AnalyzeRequest = {
  projectName: "Global Checkout v2",
  mission: "해외 결제 전환율을 높이되 국가별 규제와 접근성 요구를 충족한다.",
  sourceRole: "Product Manager",
  targetRoles: ["UX Designer", "Frontend Engineer", "Risk & Compliance"],
  brief:
    "결제 실패율을 낮추기 위해 국가별 결제수단을 우선 노출하고, 가입 없이 빠르게 결제할 수 있게 해주세요. MVP라 가능한 한 빨리 출시하고 성과가 좋으면 확대합니다.",
  constraints: ["한국·일본 1차 출시", "4주 내 베타", "WCAG 2.2 AA", "개인정보 최소 수집"],
};
