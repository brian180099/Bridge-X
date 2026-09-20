import { describe, expect, it } from "vitest";
import { meetingInput } from "../src/meetings.js";
import {
  calendarFile,
  markdownFile,
  type Meeting,
} from "../../web/src/meeting-model.js";
const fixture: Meeting = {
  id: "test",
  title: "회의",
  domain: "개발",
  participants: "김: 개발",
  context: "",
  transcript: "회의 내용",
  createdAt: "2026-09-20T00:00:00Z",
  summary: "요약",
  decisions: ["범위 확정"],
  ambiguities: [],
  glossary: [],
  tasks: [
    {
      title: "검토;할,업무\n두번째 줄",
      owner: "김",
      role: "개발",
      priority: "P1",
      reason: "선행",
      due: "2026-09-30",
      dependency: "",
      doneWhen: "검수",
      evidence: "",
      reviewed: true,
    },
    {
      title: "미확정 업무",
      owner: "미정",
      role: "운영",
      priority: "P2",
      reason: "",
      due: "2026-09-30",
      dependency: "",
      doneWhen: "",
      evidence: "",
    },
  ],
};
describe("meeting input and exports", () => {
  it("rejects missing participant context and short transcripts", () => {
    expect(
      meetingInput.safeParse({
        title: "회의",
        domain: "개발",
        participants: "",
        context: "",
        transcript: "짧음",
      }).success,
    ).toBe(false);
  });
  it("only exports reviewed dated tasks and handles month rollover", () => {
    const result = calendarFile(fixture);
    expect(result).toContain("DTEND;VALUE=DATE:20261001");
    expect(result).not.toContain("미확정 업무");
    expect(result).toContain("SUMMARY:검토\\;할\\,업무\\n두번째 줄");
    expect(result.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  it("does not export undated tasks to calendar", () => {
    expect(
      calendarFile({ ...fixture, tasks: [{ ...fixture.tasks[0], due: "" }] }),
    ).not.toContain("BEGIN:VEVENT");
  });
  it("exports reviewed tasks to Notion-compatible Markdown", () => {
    expect(markdownFile(fixture)).toContain("담당: 김");
    expect(markdownFile(fixture)).not.toContain("미확정 업무");
  });
});
