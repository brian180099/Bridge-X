import { randomUUID } from "node:crypto";

export type Decision = "keep-8" | "change-10" | "revise" | "recheck" | "stop";

export interface AgentPassport {
  id: string; name: string; organization: string; role: string;
  capabilities: string[]; allowedData: string[]; restrictedData: string[];
  canModify: string[]; mustNotModify: string[]; approvalRequired: string[];
}
export interface Handoff {
  id: string; fromAgent: string; toAgent: string; task: string; goal: string;
  output: string; evidence: string[]; assumptions: string[]; mustKeep: string[];
  canChange: string[]; completionCriteria: string[]; openQuestions: string[];
  receiverUnderstanding: string[]; receiverNeedsConfirmation: string[]; createdAt: string;
}
export interface Conflict {
  id: string; type: string; severity: "critical" | "high" | "medium";
  field: string; sourceValue: string; proposedValue: string; evidence: string[];
  violatedRule: string; permissionCheck: "allowed" | "approval-required" | "denied";
  approver: string; status: "open" | "resolved" | "revision-requested";
  ruleChecks: { rule: string; status: "passed" | "failed" | "approval-required"; detail: string }[];
}
export interface AuditEvent { id: string; at: string; actor: string; type: string; title: string; detail: string; }
export interface ProjectRun {
  id: string; projectId: string; status: "awaiting-approval" | "completed" | "revision-requested";
  currentAgent: string; verdict: "GO" | "REVISE" | "STOP"; passports: AgentPassport[];
  handoffs: Handoff[]; conflicts: Conflict[]; audit: AuditEvent[];
  approval?: { decision: Decision; reason: string; approver: string; decidedAt: string };
  finalResult?: string;
}
export interface Project { id: string; name: string; goal: string; country: string; organization: string; finalApprover: string; createdAt: string; }

const now = () => new Date().toISOString();
const event = (actor: string, type: string, title: string, detail: string): AuditEvent => ({ id: randomUUID(), at: now(), actor, type, title, detail });

export const passports: AgentPassport[] = [
  { id:"manager", name:"Manager Agent", organization:"Bridge X", role:"업무 분배와 승인 게이트 관리", capabilities:["planning","delegation","decision-routing"], allowedData:["project_brief","agent_outputs"], restrictedData:["customer_personal_data"], canModify:["task_assignment","workflow_order"], mustNotModify:["core_curriculum"], approvalRequired:["scope_change"] },
  { id:"curriculum", name:"Specialist Agent A", organization:"Project Team", role:"기준 결과와 품질 조건 관리", capabilities:["domain-analysis","quality-review"], allowedData:["project_brief","approved_evidence"], restrictedData:["restricted_personal_data"], canModify:["draft_output","delivery_detail"], mustNotModify:["approved_scope","human_decision"], approvalRequired:["scope_change"] },
  { id:"localization", name:"Specialist Agent B", organization:"Project Team", role:"프로젝트 맥락에 맞는 실행안 조정. 필수 조건은 승인 없이는 변경하지 않음", capabilities:["adaptation","context-analysis"], allowedData:["project_brief","agent_handoff"], restrictedData:["restricted_personal_data"], canModify:["execution_detail","proposed_change"], mustNotModify:["mustKeep_conditions","human_decision"], approvalRequired:["mustKeep_change"] },
  { id:"risk", name:"Quality & Risk Agent", organization:"Global Quality", role:"조건 누락·권한·품질 리스크 검증", capabilities:["quality-review","policy-check","audit"], allowedData:["all_handoffs","decision_ledger"], restrictedData:["raw_personal_data"], canModify:["risk_findings","release_recommendation"], mustNotModify:["human_decision"], approvalRequired:["risk_acceptance"] },
];

export function createProject(input: Omit<Project,"id"|"createdAt">): Project { return { ...input, id: randomUUID(), createdAt: now() }; }

export function createRun(project: Project): ProjectRun {
  const h1: Handoff = { id:randomUUID(), fromAgent:"Manager Agent", toAgent:"Korea Curriculum Agent", task:"프로젝트 목표를 기준 교육과정 업무로 분배", goal:project.goal, output:`${project.country} 출시를 위한 역할별 작업 순서와 승인 게이트 정의`, evidence:["프로젝트 목표","Agent Passport 권한표"], assumptions:[`${project.organization}이 한국 과정의 학습 품질을 기준선으로 사용`], mustKeep:["프로젝트 2회","수료평가","핵심 교육과정"], canChange:["일정 배치","홍보 문구"], completionCriteria:["8주 기준안과 근거 전달"], openQuestions:["최종 승인자는 누구인가?"], receiverUnderstanding:["프로젝트 목표와 8주 기준을 먼저 보존한다"], receiverNeedsConfirmation:["국가별 운영 제약의 우선순위"], createdAt:now() };
  const h2: Handoff = { id:randomUUID(), fromAgent:"Korea Curriculum Agent", toAgent:"Vietnam Localization Agent", task:`${project.country} 운영을 위한 8주 AI 교육과정 현지화`, goal:"현지 참여율을 높이면서 핵심 교육 품질 유지", output:"8주 교육과정 초안 — 주 2회, 프로젝트 2회, 8주차 수료평가", evidence:["한국 3개 기수 평균 수료율 87%","8주차 프로젝트 완주율 82%"], assumptions:["평일 저녁 주 2회 참여 가능"], mustKeep:["교육 기간 8주","프로젝트 2회","수료평가"], canChange:["요일·시간","현지 사례","홍보 문구"], completionCriteria:["베트남 운영팀 검토","필수 조건 보존 확인"], openQuestions:["공휴일 2주를 일정 안에서 어떻게 흡수할 것인가?"], receiverUnderstanding:["일정과 마케팅은 현지화하되 8주 계약은 유지한다"], receiverNeedsConfirmation:["기간 변경 승인 여부"], createdAt:now() };
  const h3: Handoff = { id:randomUUID(), fromAgent:"Vietnam Localization Agent", toAgent:"Quality & Risk Agent", task:"베트남 운영안 리스크 검토", goal:"현지 참여율과 교육 품질 동시 확보", output:"현지 공휴일과 직장인 일정을 반영해 교육 기간을 10주로 변경 제안", evidence:["베트남 공휴일 2주 중첩","현지 운영팀 사전 인터뷰 6건","평일 야간 선호 응답 78%"], assumptions:["주당 학습 부담을 낮추면 이탈률이 감소"], mustKeep:["프로젝트 2회","수료평가"], canChange:["요일·시간","현지 사례","홍보 문구"], completionCriteria:["기간 변경 승인","품질·리스크 검토 완료"], openQuestions:["8주 유지와 10주 변경 중 어떤 결정을 승인할 것인가?"], receiverUnderstanding:["10주 변경은 제안이며 실행 계약이 아니다"], receiverNeedsConfirmation:["course duration 변경 권한과 사람 승인"], createdAt:now() };
  const conflict: Conflict = { id:"CF-001", type:"숫자·일정·권한 충돌", severity:"critical", field:"course_duration", sourceValue:"8주 유지", proposedValue:"10주로 변경", evidence:["한국 기준안: 8주차 수료평가","베트남 근거: 공휴일 2주 중첩"], violatedRule:"Handoff mustKeep의 ‘교육 기간 8주’ 변경 + course_duration_change 승인 필요", permissionCheck:"approval-required", approver:project.finalApprover, status:"open", ruleChecks:[{rule:"숫자·일정 불일치",status:"failed",detail:"8주 기준안과 10주 제안이 다름"},{rule:"mustKeep 누락·변경",status:"failed",detail:"교육 기간 8주가 변경됨"},{rule:"권한 없는 변경",status:"approval-required",detail:"schedule은 가능하지만 course duration은 사람 승인 필요"},{rule:"승인 필요 조건",status:"approval-required",detail:"최종 승인자 결정 전 자동 실행 중단"},{rule:"근거 없는 주장",status:"passed",detail:"공휴일·인터뷰 근거가 첨부됨"},{rule:"완료 조건 누락",status:"failed",detail:"기간 변경 승인 조건이 아직 충족되지 않음"}] };
  return { id:randomUUID(), projectId:project.id, status:"awaiting-approval", currentAgent:"Human approval", verdict:"STOP", passports, handoffs:[h1,h2,h3], conflicts:[conflict], audit:[
    event("System","project.created","프로젝트 생성",`${project.country} · ${project.organization}`),
    event("Manager Agent","agent.assigned","전문 에이전트 업무 분배","Curriculum → Localization → Quality & Risk"),
    event("Korea Curriculum Agent","handoff.created","8주 기준안 전달","근거 2건과 mustKeep 3건을 포함한 표준 Handoff"),
    event("Vietnam Localization Agent","change.proposed","10주 운영안 제안","현지 공휴일과 참여 패턴을 근거로 기간 변경 제안"),
    event("Policy Engine","conflict.detected","기간 및 권한 충돌 탐지","8주 ↔ 10주, 승인 전 자동 진행 중단"),
    event("System","approval.requested",`${project.finalApprover} 승인 요청`,"course_duration_change 승인 조건 충족 필요"),
  ] };
}

export function decideRun(run: ProjectRun, decision: Decision, reason: string, approver: string): ProjectRun {
  const decidedAt=now(); const approval={decision,reason,approver,decidedAt};
  if(decision==="stop") return { ...run, approval, status:"completed", currentAgent:"Stopped by human", verdict:"STOP", finalResult:"사람의 결정으로 실행을 중단했습니다.", conflicts:run.conflicts.map(c=>({...c,status:"resolved"})), audit:[...run.audit,event(approver,"approval.decided","실행 중단",reason),event("Manager Agent","run.stopped","다음 Agent 실행 중단","사람의 중단 결정과 이유를 Decision Context에 기록했습니다.")] };
  if(decision==="revise" || decision==="recheck") return { ...run, approval, status:"revision-requested", currentAgent:decision==="revise"?"Vietnam Localization Agent":"Project owner", verdict:"REVISE", conflicts:run.conflicts.map(c=>({...c,status:"revision-requested"})), audit:[...run.audit,event(approver,"approval.decided",decision==="revise"?"수정 요청":"담당자 재검토 요청",reason),event("Manager Agent","handoff.routed","작업 재전달",decision==="revise"?"현지화 에이전트가 승인 의견을 반영합니다.":"프로젝트 담당자에게 근거 재검토를 요청했습니다.")] };
  const result=decision==="keep-8"?"8주 구조를 유지하고, 공휴일 주차는 보강 세션과 비동기 학습으로 운영합니다.":"10주 운영안을 승인하고, 동일 학습시간·프로젝트 2회·수료평가를 유지합니다.";
  return { ...run, approval, status:"completed", currentAgent:"Completed", verdict:"GO", finalResult:result, conflicts:run.conflicts.map(c=>({...c,status:"resolved"})), handoffs:[...run.handoffs,{ id:randomUUID(), fromAgent:"Quality & Risk Agent", toAgent:"Manager Agent", task:"최종 출시안 확정", goal:"승인 결정에 따른 안전한 출시", output:result, evidence:[`Human decision: ${decision}`,reason], assumptions:["승인 조건이 최종 계약에 반영됨"], mustKeep:["프로젝트 2회","수료평가","결정 기록"], canChange:["세부 운영 시간"], completionCriteria:["최종 승인 완료","Audit Log 기록 완료"], openQuestions:["다음 실행에서 확인할 운영 지표"], receiverUnderstanding:["사람의 결정과 이유를 다음 실행 입력으로 사용"], receiverNeedsConfirmation:["없음 — 승인 조건을 기준으로 실행"], createdAt:decidedAt }], audit:[...run.audit,event(approver,"approval.decided",decision==="keep-8"?"8주 유지 승인":"10주 변경 승인",reason),event("Quality & Risk Agent","run.completed","품질·리스크 검토 완료",result),event("Manager Agent","project.completed","최종 결과 확정","다음 실행 단계로 전달 가능한 GO 상태")] };
}
