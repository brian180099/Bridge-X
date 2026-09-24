import { describe, expect, it } from "vitest";
import { createProject, createRun, decideRun } from "../src/orchestration.js";

describe("multi-agent orchestration",()=>{
  it("blocks on the 8-week vs 10-week conflict and permission gate",()=>{
    const project=createProject({name:"Vietnam launch",goal:"한국 8주 AI 교육과정을 베트남에 출시",country:"베트남",organization:"Global Learning",finalApprover:"김민지"});
    const run=createRun(project);
    expect(run.status).toBe("awaiting-approval");
    expect(run.verdict).toBe("STOP");
    expect(run.conflicts[0]).toMatchObject({sourceValue:"8주 유지",proposedValue:"10주로 변경",permissionCheck:"approval-required"});
    expect(run.conflicts[0].ruleChecks.map(check=>check.rule)).toEqual(expect.arrayContaining(["숫자·일정 불일치","mustKeep 누락·변경","권한 없는 변경","근거 없는 주장","완료 조건 누락"]));
    expect(run.handoffs[2]).toMatchObject({openQuestions:expect.any(Array),receiverUnderstanding:expect.any(Array),receiverNeedsConfirmation:expect.any(Array)});
    expect(run.handoffs).toHaveLength(3);
  });
  it("passes the human decision to Quality & Risk and completes",()=>{
    const project=createProject({name:"Vietnam launch",goal:"AI course launch",country:"베트남",organization:"Global Learning",finalApprover:"김민지"});
    const completed=decideRun(createRun(project),"change-10","현지 운영 근거를 승인합니다.","김민지");
    expect(completed.status).toBe("completed");
    expect(completed.verdict).toBe("GO");
    expect(completed.handoffs.at(-1)?.evidence[0]).toContain("change-10");
    expect(completed.audit.some(e=>e.type==="project.completed")).toBe(true);
  });
});
