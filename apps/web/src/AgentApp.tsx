import { useState } from "react";
import {
  demoDecide,
  demoRun,
  passportSeed,
  type Decision,
  type Handoff,
  type Project,
  type Run,
  type View,
} from "./agent-model";
import "./agent.css";

const nav: { id: View; label: string; sub: string; icon: string }[] = [
  { id: "workflow", label: "협업 워크플로", sub: "WORKFLOW", icon: "⌘" },
  { id: "passports", label: "에이전트 권한", sub: "PASSPORTS", icon: "▣" },
  { id: "handoffs", label: "인수인계 검사", sub: "HANDOFFS", icon: "⇄" },
  { id: "conflicts", label: "충돌 및 승인", sub: "APPROVAL", icon: "◇" },
  { id: "audit", label: "실행 기록", sub: "AUDIT LOG", icon: "≡" },
];
const koDecision: Record<Decision, string> = {
  "keep-8": "기준안 승인",
  "change-10": "변경안 승인",
  revise: "수정 요청",
  recheck: "담당자 재검토",
  stop: "실행 중단",
};

export default function AgentApp() {
  const [view, setView] = useState<View>("workflow"),
    [project, setProject] = useState<Project | null>(null),
    [run, setRun] = useState<Run | null>(null),
    [creating, setCreating] = useState(false),
    [mode, setMode] = useState<"api" | "demo">("demo");
  const [form, setForm] = useState({
    name: "새 Agent 협업 프로젝트",
    goal: "여러 전문 Agent가 함께 달성해야 할 결과를 입력하세요.",
    country: "적용 지역 또는 범위",
    organization: "담당 조직",
    finalApprover: "최종 승인자",
  });
  const start = async () => {
    setCreating(true);
    let p: Project, r: Run;
    try {
      const pr = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!pr.ok) throw new Error();
      p = await pr.json();
      const rr = await fetch(`/api/projects/${p.id}/run`, { method: "POST" });
      if (!rr.ok) throw new Error();
      r = await rr.json();
      setMode("api");
    } catch {
      p = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      r = demoRun(p);
      setMode("demo");
    }
    setProject(p);
    setRun(r);
    setCreating(false);
  };
  const decide = async (decision: Decision, reason: string) => {
    if (!run || !project) return;
    let next: Run;
    try {
      if (mode === "demo") throw new Error();
      const endpoint =
        decision === "keep-8" || decision === "change-10"
          ? "approve"
          : "reject";
      const res = await fetch(`/api/runs/${run.id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason,
          approver: project.finalApprover,
        }),
      });
      if (!res.ok) throw new Error();
      next = await res.json();
    } catch {
      next = demoDecide(run, decision, reason, project.finalApprover);
    }
    setRun(next);
  };
  if (!project || !run)
    return (
      <CreateProject
        form={form}
        setForm={setForm}
        start={start}
        creating={creating}
      />
    );
  const currentNav = nav.find((n) => n.id === view)!;
  return (
    <div className="ax-shell">
      <aside className="ax-side">
        <div className="ax-logo">
              <span>OA</span>
          <div>
                <b>Operation AI</b>
                <small>AGENT OPERATIONS</small>
          </div>
        </div>
        <div className="ax-project">
          <small>ACTIVE PROJECT</small>
          <b>{project.name}</b>
          <span>
            <i />{" "}
            {run.status === "completed"
              ? "실행 완료"
              : run.status === "revision-requested"
                ? "수정 진행 중"
                : "승인 대기"}
          </span>
        </div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={view === n.id ? "active" : ""}
            >
              <i>{n.icon}</i>
              <span>
                <b>{n.label}</b>
                <small>{n.sub}</small>
              </span>
              {n.id === "conflicts" &&
                run.conflicts.some((c) => c.status === "open") && <em>1</em>}
            </button>
          ))}
        </nav>
        <div className="ax-side-bottom">
          <div>
            <span className="pulse" />
            <b>
              {mode === "api"
                ? "오케스트레이터 연결됨"
                : "재현 가능한 데모 모드"}
            </b>
            <small>내부 에이전트 시뮬레이션</small>
          </div>
          <button
            onClick={() => {
              setProject(null);
              setRun(null);
            }}
          >
            ＋ 새 프로젝트
          </button>
        </div>
      </aside>
      <main className="ax-main">
        <header>
          <div>
            <span className={`ax-verdict ${run.verdict.toLowerCase()}`}>
              {run.verdict}
            </span>
            <div className="header-title">
              <b>{currentNav.label}</b>
              <small>{currentNav.sub}</small>
            </div>
          </div>
          <div className="ax-header-meta">
            <span>
              프로젝트 <b>{project.id.slice(0, 8)}</b>
            </span>
            <span>
              최종 승인자 <b>{project.finalApprover}</b>
            </span>
          </div>
        </header>
        <div className="ax-content">
          <ProgressRail run={run} view={view} go={setView} />
          {view === "workflow" && (
            <Workflow project={project} run={run} go={setView} />
          )}{" "}
          {view === "passports" && <Passports />}{" "}
          {view === "handoffs" && <Handoffs handoffs={run.handoffs} />}{" "}
          {view === "conflicts" && <Conflicts run={run} decide={decide} />}{" "}
          {view === "audit" && <Audit run={run} />}
        </div>
      </main>
    </div>
  );
}

function ProgressRail({
  run,
  view,
  go,
}: {
  run: Run;
  view: View;
  go: (v: View) => void;
}) {
  const steps: [View, string, string][] = [
    ["workflow", "1", "업무 분배"],
    ["handoffs", "2", "결과 전달"],
    ["conflicts", "3", "충돌 결정"],
    ["audit", "4", "최종 기록"],
  ];
  const active =
    run.status === "completed"
      ? 3
      : run.status === "revision-requested"
        ? 2
        : view === "passports"
          ? 0
          : Math.max(
              0,
              steps.findIndex((s) => s[0] === view),
            );
  return (
    <div className="progress-rail">
      <div className="progress-label">
        <small>PROJECT PROGRESS</small>
        <b>
          {run.status === "completed"
            ? "모든 검토가 완료되었습니다"
            : run.status === "revision-requested"
              ? "수정 결과를 기다리는 중입니다"
              : "사람의 결정이 필요합니다"}
        </b>
      </div>
      {steps.map(([id, n, label], i) => (
        <button
          key={id}
          onClick={() => go(id)}
          className={`${i < active ? "done" : ""} ${i === active ? "active" : ""}`}
        >
          <span>{i < active ? "✓" : n}</span>
          <b>{label}</b>
        </button>
      ))}
    </div>
  );
}

function CreateProject({
  form,
  setForm,
  start,
  creating,
}: {
  form: Record<string, string>;
  setForm: (v: any) => void;
  start: () => void;
  creating: boolean;
}) {
  const field = (key: string, value: string) =>
    setForm((p: Record<string, string>) => ({ ...p, [key]: value }));
  return (
    <div className="create-shell">
      <div className="create-brand">
        <span>OA</span>
        <b>Operation AI</b>
        <small>Agent operations control plane</small>
      </div>
      <main className="create-card">
        <div className="create-copy">
          <span className="kicker">NEW PROJECT</span>
          <h1>
            에이전트 협업을
            <br />
            <em>검증 가능한 흐름</em>으로.
          </h1>
          <p>
            목표와 승인자를 설정하면 Manager Agent가 업무를 분배하고, 모든
            결과를 표준 Handoff와 권한 규칙으로 검사합니다.
          </p>
          <div className="trust-row">
            <span>4 Agent Passports</span>
            <span>Rule-first checks</span>
            <span>Human approval</span>
          </div>
        </div>
        <div className="create-form">
          <div className="form-title">
            <span>01</span>
            <div>
              <h2>프로젝트 생성</h2>
              <p>글로벌 에이전트 실행의 공통 목표를 정의하세요.</p>
            </div>
          </div>
          <label>
            프로젝트 이름
            <input
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
            />
          </label>
          <label>
            프로젝트 목표
            <textarea
              rows={3}
              value={form.goal}
              onChange={(e) => field("goal", e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              대상 국가
              <input
                value={form.country}
                onChange={(e) => field("country", e.target.value)}
              />
            </label>
            <label>
              담당 조직
              <input
                value={form.organization}
                onChange={(e) => field("organization", e.target.value)}
              />
            </label>
          </div>
          <label>
            최종 승인자
            <input
              value={form.finalApprover}
              onChange={(e) => field("finalApprover", e.target.value)}
            />
          </label>
          <button
            className="launch"
            disabled={creating || Object.values(form).some((v) => !v.trim())}
            onClick={start}
          >
            {creating ? "에이전트 실행 준비 중…" : "프로젝트 생성 & 실행 시작"}
            <span>→</span>
          </button>
          <small className="demo-note">
          실제 외부 에이전트 연동이 아닌 내부 에이전트 시뮬레이션입니다.
          </small>
        </div>
      </main>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
  tip,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tip?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="section-copy">
        <p>{body}</p>
        {tip && (
          <small>
            <b>이 화면에서 할 일</b>
            {tip}
          </small>
        )}
      </div>
    </div>
  );
}
function Workflow({
  project,
  run,
  go,
}: {
  project: Project;
  run: Run;
  go: (v: View) => void;
}) {
  const state = (i: number) =>
    run.status === "completed"
      ? "done"
      : run.status === "revision-requested"
        ? i < 2
          ? "done"
          : i === 2
            ? "running"
            : "waiting"
        : i < 2
          ? "done"
          : i === 2
            ? "blocked"
            : "waiting";
  return (
    <>
      <SectionHead
        eyebrow="ORCHESTRATION"
        title="에이전트 협업 워크플로"
        body="에이전트가 무엇을 전달했고, 다음 에이전트가 어떻게 응답했는지 한 흐름에서 확인합니다."
        tip={
          run.status === "awaiting-approval"
            ? "빨간 충돌 지점을 확인하고 승인 방향을 결정하세요."
            : "최종 결과와 전달 기록을 확인하세요."
        }
      />
      <section className="mission-card">
        <div>
          <span>PROJECT MISSION</span>
          <h2>{project.goal}</h2>
          <p>
            {project.country} · {project.organization}
          </p>
        </div>
        <div className="mission-metrics">
          <div>
            <b>{run.passports.length}</b>
            <small>AGENTS</small>
          </div>
          <div>
            <b>{run.handoffs.length}</b>
            <small>HANDOFFS</small>
          </div>
          <div>
            <b>{run.conflicts.length}</b>
            <small>CONFLICT</small>
          </div>
        </div>
      </section>
      <div className="flow-line">
        {run.passports.map((p, i) => (
          <div className="flow-item" key={p.id}>
            <article className={state(i)}>
              <div className="agent-icon">
                {i === 0 ? "M" : i === 1 ? "A" : i === 2 ? "B" : "QR"}
              </div>
              <span className="state-dot">
                {state(i) === "done"
                  ? "✓"
                  : state(i) === "blocked"
                    ? "!"
                    : state(i) === "running"
                      ? "↻"
                      : "·"}
              </span>
              <small>
                {state(i) === "done"
                  ? "완료"
                  : state(i) === "blocked"
                    ? "승인 대기"
                    : state(i) === "running"
                      ? "재작업 중"
                      : "대기"}
              </small>
              <h3>{p.name}</h3>
              <p>{p.role}</p>
            </article>
            {i < 3 && (
              <div
                className={`connector ${i === 1 && run.status === "awaiting-approval" ? "danger" : ""}`}
              >
                <span>HANDOFF {String(i + 1).padStart(2, "0")}</span>
                <i>→</i>
              </div>
            )}
          </div>
        ))}
      </div>
      {run.status === "awaiting-approval" && (
        <section className="gate-card">
          <div className="gate-icon">!</div>
          <div>
            <span>HUMAN APPROVAL GATE</span>
            <h2>자동 실행이 중단되었습니다</h2>
            <p>
              <b>{run.conflicts[0]?.sourceValue}</b>와{" "}
              <b>{run.conflicts[0]?.proposedValue}</b>이 충돌했습니다. 권한과
              근거를 검토한 후 다음 실행을 결정하세요.
            </p>
          </div>
          <button onClick={() => go("conflicts")}>
            충돌 검토 & 승인 <span>→</span>
          </button>
        </section>
      )}
      {run.status === "completed" && (
        <section className="result-card">
          <span>FINAL RESULT · {run.verdict}</span>
          <h2>{run.finalResult}</h2>
          <p>
            사람의 결정과 이유가 다음 Agent Handoff evidence와 Audit Log에
            기록되었습니다.
          </p>
          <button onClick={() => go("audit")}>전체 기록 보기 →</button>
        </section>
      )}
      {run.status === "revision-requested" && (
        <section className="revise-card">
          <span>REVISE</span>
          <h2>{run.currentAgent}에게 작업이 돌아갔습니다</h2>
          <p>승인자의 선택과 이유가 새 입력 맥락으로 전달되었습니다.</p>
        </section>
      )}
      <DynamicCollaborationPanel run={run} go={go} />
    </>
  );
}

function CollaborationPanel({
  run,
  go,
  project,
}: {
  run: Run;
  go: (v: View) => void;
  project: Project;
}) {
  const messages = [
    {
      agent: "Manager Agent",
      avatar: "M",
      tone: "manager",
      label: "업무 요청",
      text: `${project.goal} — ${project.country} 운영안을 설계해 주세요.`,
      meta: `${project.organization}의 목표·권한·완료 조건 전달`,
    },
    {
      agent: "Korea Curriculum Agent",
      avatar: "KR",
      tone: "korea",
      label: "기준안 전달",
      text: "수료율 87%를 근거로 8주 과정과 프로젝트 2회를 필수 조건으로 제안합니다.",
      meta: "Vietnam Localization Agent가 Structured Handoff 수신",
    },
    {
      agent: "Vietnam Localization Agent",
      avatar: "VN",
      tone: "vietnam",
      label: "대안 및 이견",
      text: `${project.country} 공휴일이 2주 겹칩니다. 학습 품질을 유지하되 10주 운영으로 변경을 요청합니다.`,
      meta: "schedule·marketing copy만 변경 가능, 기간 변경은 사람 승인 필요",
    },
    ...(run.approval
      ? [
          {
            agent: "Human approver",
            avatar: "H",
            tone: "human",
            label: "결정 공유",
            text: `${koDecision[run.approval.decision]} — ${run.approval.reason}`,
            meta: "결정 이유가 다음 Agent Handoff evidence와 decision context로 전달됨",
          },
        ]
      : []),
    ...(run.status === "completed"
      ? [
          {
            agent: "Quality & Risk Agent",
            avatar: "QR",
            tone: "risk",
            label: "검토 응답",
            text:
              run.finalResult ?? "승인 조건을 반영해 최종안을 확정했습니다.",
            meta: "Manager Agent가 최종 결과 수신",
          },
        ]
      : []),
  ];
  return (
    <section className="collab-panel">
      <div className="card-heading">
        <div>
          <span>AGENT COLLABORATION</span>
          <h2>에이전트 협업 흐름</h2>
          <p>
            업무 요청 → 기준안 → 현지화 이견 → 권한 검사 → 사람 결정 → 다음
            Agent 입력
          </p>
        </div>
        <button onClick={() => go("handoffs")}>전체 Handoff 보기 →</button>
      </div>
      <div className="collab-stream">
        {messages.map((m, i) => (
          <article key={`${m.agent}-${i}`}>
            <div className={`collab-avatar ${m.tone}`}>{m.avatar}</div>
            <div className="collab-message">
              <div>
                <b>{m.agent}</b>
                <span>{m.label}</span>
              </div>
              <p>{m.text}</p>
              <small>
                <i>↳</i>
                {m.meta}
              </small>
            </div>
            {i < messages.length - 1 && <div className="collab-link">↓</div>}
          </article>
        ))}
      </div>
    </section>
  );
}

function DynamicCollaborationPanel({
  run,
  go,
}: {
  run: Run;
  go: (v: View) => void;
}) {
  const messages = run.handoffs.map((h, i) => ({
    agent: h.fromAgent,
    avatar: h.fromAgent.slice(0, 2),
    tone:
      i === 0 ? "manager" : i === run.handoffs.length - 1 ? "risk" : "korea",
    label: i === 0 ? "업무 요청" : "Structured Handoff 전달",
    text: h.output,
    meta: `${h.toAgent}가 goal·evidence·mustKeep·완료 조건을 수신`,
  }));
  if (run.approval)
    messages.push({
      agent: "Human approver",
      avatar: "H",
      tone: "human",
      label: "Decision Context",
      text: `${koDecision[run.approval.decision]} — ${run.approval.reason}`,
      meta: "결정 이유가 다음 Agent Handoff evidence와 Audit Log에 기록됨",
    });
  return (
    <section className="collab-panel">
      <div className="card-heading">
        <div>
          <span>AGENT COLLABORATION</span>
          <h2>에이전트 협업 흐름</h2>
          <p>
            프로젝트 목표 → 업무 분배 → Structured Handoff → 충돌 검사 → 사람
            결정 → 다음 Agent 입력
          </p>
        </div>
        <button onClick={() => go("handoffs")}>전체 Handoff 보기 →</button>
      </div>
      <div className="collab-stream">
        {messages.map((m, i) => (
          <article key={`${m.agent}-${i}`}>
            <div className={`collab-avatar ${m.tone}`}>{m.avatar}</div>
            <div className="collab-message">
              <div>
                <b>{m.agent}</b>
                <span>{m.label}</span>
              </div>
              <p>{m.text}</p>
              <small>
                <i>↳</i>
                {m.meta}
              </small>
            </div>
            {i < messages.length - 1 && <div className="collab-link">↓</div>}
          </article>
        ))}
      </div>
    </section>
  );
}

function Passports() {
  return (
    <>
      <SectionHead
        eyebrow="IDENTITY & AUTHORITY"
        title="에이전트 역할과 권한"
        body="각 에이전트가 할 수 있는 일과 반드시 사람에게 물어야 하는 일을 한눈에 확인합니다."
        tip="승인이 필요한 변경과 수정 금지 항목을 먼저 확인하세요."
      />
      <div className="passport-grid">
        {passportSeed.map((p, i) => (
          <article key={p.id}>
            <div className="passport-top">
              <span>
                {i === 0 ? "M" : i === 1 ? "A" : i === 2 ? "B" : "QR"}
              </span>
              <div>
                <small>{p.organization}</small>
                <h2>{p.name}</h2>
              </div>
              <em>검증됨</em>
            </div>
            <p>{p.role}</p>
            <TagBlock title="보유 역량" items={p.capabilities} />
            <div className="permission-grid">
              <TagBlock
                title="접근 가능 데이터"
                items={p.allowedData}
                tone="green"
              />
              <TagBlock
                title="접근 제한 데이터"
                items={p.restrictedData}
                tone="red"
              />
            </div>
            <div className="rule-list">
              <div>
                <b>변경 가능</b>
                <span>{p.canModify.join(" · ")}</span>
              </div>
              <div>
                <b>변경 금지</b>
                <span>{p.mustNotModify.join(" · ")}</span>
              </div>
              <div className="approval-rule">
                <b>사람 승인 필요</b>
                <span>{p.approvalRequired.join(" · ")}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function TagBlock({
  title,
  items,
  tone = "",
}: {
  title: string;
  items: string[];
  tone?: string;
}) {
  return (
    <div className={`tag-block ${tone}`}>
      <b>{title}</b>
      <div>
        {items.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </div>
  );
}

function Handoffs({ handoffs }: { handoffs: Handoff[] }) {
  const [selected, setSelected] = useState(handoffs.length - 1);
  const h = handoffs[Math.min(selected, handoffs.length - 1)];
  return (
    <>
      <SectionHead
        eyebrow="STRUCTURED HANDOFF"
        title="실행 계약 Handoff Inspector"
        body="Handoff는 결과를 복사하는 기능이 아니라 다음 Agent가 실행할 계약입니다. 송신 결과와 수신 해석을 나란히 비교합니다."
        tip="왼쪽 전달 기록을 선택하고 수신 Agent가 다시 확인할 항목을 검토하세요."
      />
      <div className="inspector">
        <aside>
          {handoffs.map((x, i) => (
            <button
              key={x.id}
              className={selected === i ? "active" : ""}
              onClick={() => setSelected(i)}
            >
              <small>
                {x.id} ·{" "}
                {new Date(x.createdAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
              <b>{x.fromAgent}</b>
              <span>→ {x.toAgent}</span>
            </button>
          ))}
        </aside>
        <article>
          <div className="handoff-route">
            <div>
              <small>송신 Agent</small>
              <b>{h.fromAgent}</b>
            </div>
            <span>→</span>
            <div>
              <small>수신 Agent</small>
              <b>{h.toAgent}</b>
            </div>
            <em>실행 계약 · 스키마 통과</em>
          </div>
          <div className="handoff-main">
            <small>목적 · GOAL</small>
            <h2>{h.task}</h2>
            <p>{h.goal}</p>
            <div className="output-box">
              <b>산출물 · OUTPUT</b>
              {h.output}
            </div>
          </div>
          <div className="handoff-fields">
            <Field title="EVIDENCE · 근거" items={h.evidence} />
            <Field
              title="FACTS & ASSUMPTIONS · 사실과 가정"
              items={h.assumptions}
            />
            <Field
              title="MUST KEEP · 필수 조건"
              items={h.mustKeep}
              tone="must"
            />
            <Field
              title="CAN CHANGE · 변경 가능"
              items={h.canChange}
              tone="change"
            />
            <Field
              title="COMPLETION CRITERIA · 완료 조건"
              items={h.completionCriteria}
              wide
            />
            <Field
              title="OPEN QUESTIONS · 미해결 질문"
              items={h.openQuestions}
              tone="change"
            />
          </div>
          <div className="receiver-compare">
            <div>
              <span>수신 Agent가 이해한 내용</span>
              {h.receiverUnderstanding.map((x) => (
                <p key={x}>✓ {x}</p>
              ))}
            </div>
            <div>
              <span>수신 Agent가 다시 확인해야 하는 내용</span>
              {h.receiverNeedsConfirmation.map((x) => (
                <p key={x}>! {x}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
function Field({
  title,
  items,
  tone = "",
  wide = false,
}: {
  title: string;
  items: string[];
  tone?: string;
  wide?: boolean;
}) {
  return (
    <div className={`field ${tone} ${wide ? "wide" : ""}`}>
      <b>{title}</b>
      {items.map((x) => (
        <p key={x}>
          <span>✓</span>
          {x}
        </p>
      ))}
    </div>
  );
}

function Conflicts({
  run,
  decide,
}: {
  run: Run;
  decide: (d: Decision, r: string) => void;
}) {
  const [choice, setChoice] = useState<Decision>("keep-8"),
    [reason, setReason] = useState("");
  const c = run.conflicts[0];
  if (run.status !== "awaiting-approval")
    return (
      <>
        <SectionHead
          eyebrow="DECISION LEDGER"
          title="Conflict & Approval"
          body="승인자의 결정과 이유는 변경 불가능한 실행 맥락으로 다음 에이전트에게 전달됩니다."
        />
        <section className="decision-done">
          <span>
            {run.verdict === "GO" ? "✓" : run.verdict === "STOP" ? "■" : "↻"}
          </span>
          <h2>{run.approval && koDecision[run.approval.decision]}</h2>
          <p>{run.approval?.reason}</p>
          <small>
            {run.approval?.approver} ·{" "}
            {run.approval &&
              new Date(run.approval.decidedAt).toLocaleString("ko-KR")}
          </small>
        </section>
      </>
    );
  return (
    <>
      <SectionHead
        eyebrow="ACTION REQUIRED"
        title="Conflict & Approval"
        body="규칙 엔진이 먼저 검사하고, 의미 충돌의 최종 판단은 사람이 내립니다."
      />
      <div className="conflict-layout">
        <section className="conflict-card">
          <div className="conflict-head">
            <span>CRITICAL</span>
            <div>
              <small>
                {c.id} · {c.type}
              </small>
              <h2>
                {c.sourceValue} ↔ {c.proposedValue}
              </h2>
            </div>
            <em>자동 진행 중단</em>
          </div>
          <div className="meaning-diff">
            <div>
              <small>기준 결과</small>
              <b>{c.sourceValue}</b>
              <p>{c.violatedRule}</p>
            </div>
            <span>≠</span>
            <div>
              <small>후속 Agent 제안</small>
              <b>{c.proposedValue}</b>
              <p>{c.evidence.join(" · ")}</p>
            </div>
          </div>
          <div className="rule-checks">
            <h3>Rule checks</h3>
            {(c.ruleChecks ?? []).map((rule) => {
              const tone = rule.status.includes("passed")
                ? "pass"
                : rule.status.includes("failed")
                  ? "fail"
                  : "warn";
              const label =
                rule.status === "passed"
                  ? "PASSED"
                  : rule.status === "failed"
                    ? "FAILED"
                    : rule.status === "needs-review"
                      ? "NEEDS REVIEW"
                      : "APPROVAL REQUIRED";
              return (
                <div key={rule.rule}>
                  <span className={tone}>
                    {tone === "pass" ? "✓" : tone === "fail" ? "!" : "⌁"}
                  </span>
                  <p>
                    <b>{rule.rule}</b>
                    <small>{rule.detail}</small>
                  </p>
                  <em>{label}</em>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="approval-panel">
          <span className="kicker">HUMAN DECISION</span>
          <h2>{c.approver}님의 결정이 필요합니다</h2>
          <p>
            결정은 다음 Agent의 Handoff evidence와 Decision Context에
            포함됩니다.
          </p>
          <div className="decision-options">
            {(
              ["keep-8", "change-10", "revise", "recheck", "stop"] as Decision[]
            ).map((d) => (
              <button
                className={choice === d ? "selected" : ""}
                onClick={() => setChoice(d)}
                key={d}
              >
                <i>{choice === d ? "●" : "○"}</i>
                <span>
                  <b>{koDecision[d]}</b>
                  <small>
                    {d === "keep-8"
                      ? "현재 기준 결과를 유지"
                      : d === "change-10"
                        ? "후속 Agent 제안을 승인"
                        : d === "revise"
                          ? "수정안을 다시 요청"
                          : d === "recheck"
                            ? "근거를 담당자가 재검토"
                            : "이번 실행을 중단"}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <label>
            결정 이유 <b>필수</b>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="판단 근거와 다음 Agent가 지켜야 할 조건을 입력하세요."
            />
          </label>
          <button
            className="approve-btn"
            disabled={!reason.trim()}
            onClick={() => decide(choice, reason)}
          >
            결정 기록 & 다음 단계 실행 <span>→</span>
          </button>
        </aside>
      </div>
    </>
  );
}

function Audit({ run }: { run: Run }) {
  return (
    <>
      <SectionHead
        eyebrow="TRACEABILITY"
        title="Audit Log"
        body="누가, 어떤 입력을 받아, 무엇을 만들고, 어떤 결정으로 다음 단계가 바뀌었는지 추적합니다."
      />
      <div className="audit-summary">
        <div>
          <b>{run.audit.length}</b>
          <span>EVENTS</span>
        </div>
        <div>
          <b>{run.handoffs.length}</b>
          <span>HANDOFFS</span>
        </div>
        <div>
          <b>{run.conflicts.length}</b>
          <span>CONFLICTS</span>
        </div>
        <div>
          <b>{run.approval ? 1 : 0}</b>
          <span>HUMAN DECISIONS</span>
        </div>
        <em>Export-ready record</em>
      </div>
      <section className="timeline">
        {run.audit.map((e, i) => (
          <article key={e.id}>
            <div
              className={`timeline-icon t${e.type.includes("conflict") ? "danger" : e.type.includes("approval") ? "decision" : e.type.includes("completed") ? "success" : "normal"}`}
            >
              {e.type.includes("completed")
                ? "✓"
                : e.type.includes("conflict")
                  ? "!"
                  : i + 1}
            </div>
            <div className="timeline-time">
              <b>
                {new Date(e.at).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </b>
              <small>{new Date(e.at).toLocaleDateString("ko-KR")}</small>
            </div>
            <div className="timeline-body">
              <div>
                <span>{e.type.toUpperCase()}</span>
                <em>{e.actor}</em>
              </div>
              <h3>{e.title}</h3>
              <p>{e.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
