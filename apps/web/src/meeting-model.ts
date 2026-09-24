export interface Task {
  title: string;
  owner: string;
  role: string;
  priority: "P1" | "P2" | "P3";
  reason: string;
  due: string;
  dependency: string;
  doneWhen: string;
  evidence: string;
  reviewed?: boolean;
  completed?: boolean;
}
export interface Meeting {
  id: string;
  title: string;
  domain: string;
  participants: string;
  context: string;
  transcript: string;
  createdAt: string;
  summary: string;
  decisions: string[];
  tasks: Task[];
  ambiguities: {
    phrase: string;
    interpretations: string;
    question: string;
    suggestion: string;
  }[];
  glossary: { term: string; explanation: string; caution: string }[];
}
export function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escapeICS = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function calendarFile(meeting: Meeting) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Operation AI//Meetings//KO",
    "CALSCALE:GREGORIAN",
  ];
  meeting.tasks.forEach((task, index) => {
    if (!task.reviewed || !task.due) return;
    const date = new Date(task.due + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return;
    date.setUTCDate(date.getUTCDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + meeting.id + "-" + index + "@operation-ai",
      "DTSTAMP:" +
        new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, ""),
      "DTSTART;VALUE=DATE:" + task.due.replace(/-/g, ""),
      "DTEND;VALUE=DATE:" + date.toISOString().slice(0, 10).replace(/-/g, ""),
      "SUMMARY:" + escapeICS(task.title),
      "DESCRIPTION:" + escapeICS(task.owner + " · " + task.doneWhen),
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines
    .map((line) => {
      let result = "",
        width = 0;
      for (const char of line) {
        const length = new TextEncoder().encode(char).length;
        if (width + length > 73) {
          result += "\r\n ";
          width = 1;
        }
        result += char;
        width += length;
      }
      return result;
    })
    .join("\r\n");
}
export function markdownFile(meeting: Meeting) {
  return (
    "# " +
    meeting.title +
    "\n\n" +
    meeting.summary +
    "\n\n## 확정한 업무\n\n" +
    meeting.tasks
      .filter((t) => t.reviewed)
      .map(
        (t) =>
          "- [" +
          (t.completed ? "x" : " ") +
          "] " +
          t.title +
          "\n  - 담당: " +
          t.owner +
          " / " +
          t.role +
          "\n  - 우선순위: " +
          t.priority +
          " / 기한: " +
          (t.due || "미정") +
          "\n  - 완료 기준: " +
          t.doneWhen,
      )
      .join("\n") +
    "\n\n## 결정 사항\n" +
    meeting.decisions.map((d) => "- " + d).join("\n")
  );
}
