import type { AnalyzeRequest, AnalyzeResponse } from "./types";

export interface WorkspaceRecord {
  id: string;
  createdAt: string;
  request: AnalyzeRequest;
  analysis: AnalyzeResponse;
  confirmedRoles: string[];
  confirmedDecisions: string[];
}

const STORAGE_KEY = "bridge-x-workspace-v2";

export function loadRecords(): WorkspaceRecord[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as WorkspaceRecord[]) : [];
  } catch { return []; }
}

export function saveRecords(records: WorkspaceRecord[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
export function categoryKey(label: string) {
  const value = label.toLowerCase();
  if (/목표|성과|성공|지표|goal|metric/.test(value)) return "goal";
  if (/범위|우선|scope|priority/.test(value)) return "scope";
  if (/제약|규제|보안|constraint|risk/.test(value)) return "constraint";
  if (/책임|담당|소유|owner|role/.test(value)) return "ownership";
  if (/완료|인수|검수|done|handoff/.test(value)) return "completion";
  return "other";
}
export const categoryMeta = {
  all: { label: "전체", icon: "▦" }, goal: { label: "목표·성과", icon: "◎" }, scope: { label: "범위·우선순위", icon: "◇" },
  constraint: { label: "제약·리스크", icon: "△" }, ownership: { label: "역할·책임", icon: "◉" }, completion: { label: "완료·인수인계", icon: "✓" }, other: { label: "기타 맥락", icon: "＋" },
} as const;
export type CategoryKey = keyof typeof categoryMeta;
