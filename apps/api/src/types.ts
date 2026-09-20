import { z } from "zod";

export const analyzeRequestSchema = z.object({
  projectName: z.string().trim().min(2).max(120),
  mission: z.string().trim().min(10).max(600),
  sourceRole: z.string().trim().min(2).max(80),
  targetRoles: z.array(z.string().trim().min(2).max(80)).min(1).max(6),
  brief: z.string().trim().min(30).max(5000),
  constraints: z.array(z.string().trim().min(2).max(240)).max(12).default([]),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export type Severity = "critical" | "high" | "medium" | "low";
export type Verdict = "GO" | "REVISE" | "STOP";

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
export interface RoleLens {
  role: string;
  focus: string;
  interpretation: string;
  needs: string[];
  hiddenRisk: string;
}

export interface ReceiverReceipt {
  role: string;
  understood: string;
  willDeliver: string;
  missing: string;
  confidence: number;
}

export interface ContractSection {
  title: string;
  items: string[];
}

export interface DecisionItem {
  id: string;
  question: string;
  owner: string;
  due: string;
  status: "open" | "proposed" | "confirmed";
}

export interface AnalyzeResponse {
  analysisId: string;
  generatedAt: string;
  generationMode: "ai" | "deterministic" | "deterministic-fallback";
  verdict: Verdict;
  summary: string;
  scores: {
    alignment: number;
    readiness: number;
    semanticRisk: number;
  };
  meaningDiffs: MeaningDiff[];
  roleLenses: RoleLens[];
  sharedContract: ContractSection[];
  decisions: DecisionItem[];
  receiverReceipts: ReceiverReceipt[];
}
