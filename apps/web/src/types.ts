export type Severity = "critical" | "high" | "medium" | "low";
export type Verdict = "GO" | "REVISE" | "STOP";

export interface AnalyzeRequest {
  projectName: string;
  mission: string;
  sourceRole: string;
  targetRoles: string[];
  brief: string;
  constraints: string[];
}
export interface MeaningDiff {
  id: string;
  severity: Severity;
  category: string;
  sourcePhrase: string;
  senderIntent: string;
  receiverInterpretation: string;
  impact: string;
  requiredDecision: string;
}

export interface AnalyzeResponse {
  analysisId: string;
  generatedAt: string;
  generationMode: "ai" | "deterministic" | "deterministic-fallback";
  verdict: Verdict;
  summary: string;
  scores: { alignment: number; readiness: number; semanticRisk: number };
  meaningDiffs: MeaningDiff[];
  roleLenses: Array<{
    role: string;
    focus: string;
    interpretation: string;
    needs: string[];
    hiddenRisk: string;
  }>;
  sharedContract: Array<{ title: string; items: string[] }>;
  decisions: Array<{
    id: string;
    question: string;
    owner: string;
    due: string;
    status: "open" | "proposed" | "confirmed";
  }>;
  receiverReceipts: Array<{
    role: string;
    understood: string;
    willDeliver: string;
    missing: string;
    confidence: number;
  }>;
}
