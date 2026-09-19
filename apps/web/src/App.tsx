import { useEffect, useMemo, useState } from "react";
import { sampleAnalysis, sampleRequest } from "./data";
import type { AnalyzeRequest, AnalyzeResponse, Severity } from "./types";

type Tab = "diff" | "lenses" | "contract" | "receipts";

const availableRoles = [
  "UX Designer",
  "Frontend Engineer",
  "Backend Engineer",
  "Risk & Compliance",
  "Marketing",
  "Sales",
];

const roleLabels: Record<string, string> = {
  "Product Manager": "프로덕트 매니저",
  "UX Designer": "UX 디자이너",
  "Frontend Engineer": "프론트엔드 개발",
  "Backend Engineer": "백엔드 개발",
  "Risk & Compliance": "리스크·컴플라이언스",
  Marketing: "마케팅",
  Sales: "영업",
};

function displayRole(role: string) {
  return roleLabels[role] ?? role;
}

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "diff", label: "오해 진단" },
  { id: "lenses", label: "직무별 해석" },
  { id: "contract", label: "실행 합의" },
  { id: "receipts", label: "이해 확인" },
];

const tabDescriptions: Record<Tab, { title: string; body: string }> = {
  diff: {
    title: "같은 문장을 다르게 이해할 수 있는 지점입니다",
    body: "중요도가 높은 항목부터 확인하고, ‘결정 필요’에 적힌 질문을 팀에서 합의하세요.",
  },
  lenses: {
    title: "각 직무가 이 요청을 어떻게 받아들이는지 보여줍니다",
    body: "역할별 관심사와 필요한 정보가 원래 의도에서 벗어나지 않았는지 비교하세요.",
  },
  contract: {
    title: "오해를 줄인 뒤 실제로 전달할 실행 문서입니다",
    body: "목표·범위·필수 제약·완료 조건을 확인하고 오른쪽의 미결정 항목을 확정하세요.",
  },
  receipts: {
    title: "업무를 받는 사람이 자신의 이해를 확인합니다",
    body: "각 담당자가 이해한 목표와 납품물을 확인하면 인수인계가 완료됩니다.",
  },
};

const verdictLabels = {
  GO: "바로 시작 가능",
  REVISE: "수정 후 시작",
  STOP: "먼저 합의 필요",
} as const;

function scoreTone(score: number, inverse = false) {
  const risky = inverse ? score > 70 : score < 55;
  const caution = inverse ? score > 45 : score < 75;
  return risky ? "danger" : caution ? "warning" : "good";
}

function App() {
  const [form, setForm] = useState<AnalyzeRequest>(sampleRequest);
  const [analyzedRequest, setAnalyzedRequest] = useState<AnalyzeRequest>(sampleRequest);
  const [analysis, setAnalysis] = useState<AnalyzeResponse>(sampleAnalysis);
  const [activeTab, setActiveTab] = useState<Tab>("diff");
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [isExample, setIsExample] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmedReceipts, setConfirmedReceipts] = useState<string[]>([]);
  const [notice, setNotice] = useState("샘플 분석을 불러왔습니다. 내용을 바꾸고 다시 실행해 보세요.");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("offline");
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
  }, []);

  const criticalCount = useMemo(
    () => analysis.meaningDiffs.filter((item) => item.severity === "critical").length,
    [analysis],
  );
  const canAnalyze =
    form.projectName.trim().length >= 2 &&
    form.mission.trim().length >= 10 &&
    form.brief.trim().length >= 30 &&
    form.targetRoles.length > 0;
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  function moveToTab(index: number) {
    const nextTab = tabs[index];
    if (!nextTab) return;
    setActiveTab(nextTab.id);
    window.requestAnimationFrame(() => {
      document.querySelector(".result-body")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateField<K extends keyof AnalyzeRequest>(key: K, value: AnalyzeRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
  }

  function toggleRole(role: string) {
    setIsDirty(true);
    setForm((current) => {
      const exists = current.targetRoles.includes(role);
      if (exists && current.targetRoles.length === 1) return current;
      return {
        ...current,
        targetRoles: exists
          ? current.targetRoles.filter((item) => item !== role)
          : [...current.targetRoles, role].slice(0, 6),
      };
    });
  }

  async function runAnalysis() {
    if (!canAnalyze) {
      setNotice("프로젝트 이름, 최종 목표, 30자 이상의 업무 요청을 입력해 주세요.");
      return;
    }
    setLoading(true);
    setNotice("역할별 해석과 의미 충돌을 비교하고 있습니다…");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("analysis failed");
      const result = (await response.json()) as AnalyzeResponse;
      setAnalysis(result);
      setAnalyzedRequest({ ...form, targetRoles: [...form.targetRoles], constraints: [...form.constraints] });
      setIsExample(false);
      setIsDirty(false);
      setConfirmedReceipts([]);
      setApiOnline(true);
      setActiveTab("diff");
      setNotice(
        result.generationMode === "ai"
          ? "AI Role Lens 분석이 완료됐습니다."
          : "로컬 데모 엔진 분석이 완료됐습니다.",
      );
      if (window.matchMedia("(max-width: 760px)").matches) {
        window.setTimeout(() => {
          document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    } catch {
      setAnalysis(sampleAnalysis);
      setAnalyzedRequest(sampleRequest);
      setIsExample(true);
      setIsDirty(true);
      setApiOnline(false);
      setNotice("API가 꺼져 있어 내장 샘플 결과를 표시합니다. npm run dev로 전체 기능을 실행하세요.");
    } finally {
      setLoading(false);
    }
  }

  function exportReport() {
    const lines = [
      `# ${analyzedRequest.projectName} · Semantic Handoff Report`,
      "",
      `- Verdict: **${analysis.verdict}**`,
      `- Alignment: ${analysis.scores.alignment}`,
      `- Readiness: ${analysis.scores.readiness}`,
      `- Semantic risk: ${analysis.scores.semanticRisk}`,
      "",
      `> ${analysis.summary}`,
      "",
      "## Meaning Diff",
      "",
      ...analysis.meaningDiffs.flatMap((item) => [
        `### ${item.id} · ${item.category} [${item.severity.toUpperCase()}]`,
        "",
        `- 원문: “${item.sourcePhrase}”`,
        `- 송신 의도: ${item.senderIntent}`,
        `- 수신 해석: ${item.receiverInterpretation}`,
        `- 영향: ${item.impact}`,
        `- 결정 필요: ${item.requiredDecision}`,
        "",
      ]),
      "## Shared Contract",
      "",
      ...analysis.sharedContract.flatMap((section) => [
        `### ${section.title}`,
        "",
        ...section.items.map((item) => `- ${item}`),
        "",
      ]),
      "## Decision Ledger",
      "",
      ...analysis.decisions.map(
        (item) => `- [ ] **${item.id}** ${item.question} — ${item.owner}, ${item.due}`,
      ),
      "",
      "---",
      `Generated by Bridge X · ${new Date(analysis.generatedAt).toLocaleString("ko-KR")}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${analyzedRequest.projectName.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-")}-relay.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("분석 결과와 Shared Contract를 Markdown 파일로 내보냈습니다.");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bridge X 홈">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>
            <strong>Bridge X</strong>
            <small>CONTEXT HANDOFF</small>
          </span>
        </a>
        <div className="product-label">
          <span>CURRENT MVP · SPEC PREFLIGHT</span>
          <p>사람과 AI 사이, 일이 넘어가기 전에 의미를 검증합니다</p>
        </div>
        <div className={`api-status ${apiOnline ? "online" : "offline"}`}>
          <i />
          {apiOnline ? "분석 준비됨" : "체험 모드"}
        </div>
      </header>

      <section id="top" className="quick-guide" aria-label="Bridge X 사용 방법">
        <div className="guide-intro">
          <span>BRIDGE X · AGENT HANDOFF &amp; CONTEXT COORDINATION</span>
          <strong>업무 요청이 사람·직무·AI 사이에서 다르게 이해되는 지점을 찾아 실행 가능한 합의로 바꿉니다.</strong>
        </div>
        <ol>
          <li><b>1</b><span><strong>요청 입력</strong><small>평소 쓰는 문장 그대로</small></span></li>
          <li><b>2</b><span><strong>오해 확인</strong><small>직무별 해석 차이 비교</small></span></li>
          <li><b>3</b><span><strong>합의 후 전달</strong><small>실행안과 담당자 확정</small></span></li>
        </ol>
      </section>

      <main className="workspace">
        <aside className="composer">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">STEP 1 · 업무 요청 입력</span>
              <h1>무엇을 전달할까요?</h1>
              <p>실제로 팀에 보낼 내용을 그대로 입력하세요.</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setForm(sampleRequest);
                setAnalyzedRequest(sampleRequest);
                setAnalysis(sampleAnalysis);
                setIsExample(true);
                setIsDirty(false);
                setNotice("예시 요청과 분석 결과를 불러왔습니다.");
              }}
            >
              예시 보기
            </button>
          </div>

          <label className="field">
            <span>프로젝트 이름</span>
            <input
              placeholder="예: 신규 결제 화면 개선"
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
            />
          </label>

          <label className="field">
            <span>이번 일의 최종 목표</span>
            <textarea
              className="mission-input"
              placeholder="예: 결제 이탈률을 낮추면서 필수 규정을 지킨다"
              value={form.mission}
              onChange={(event) => updateField("mission", event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>나는 어떤 역할인가요?</span>
              <input
                placeholder="예: Product Manager"
                value={form.sourceRole}
                onChange={(event) => updateField("sourceRole", event.target.value)}
              />
            </label>
            <div className="mini-stat">
              <span>선택한 직무</span>
              <strong>{form.targetRoles.length}</strong>
              <small>명에게 전달</small>
            </div>
          </div>

          <fieldset className="role-picker">
            <legend>누가 이 요청을 받나요? <em>1명 이상 선택</em></legend>
            <div className="role-options">
              {availableRoles.map((role) => (
                <button
                  type="button"
                  key={role}
                  aria-pressed={form.targetRoles.includes(role)}
                  className={form.targetRoles.includes(role) ? "selected" : ""}
                  onClick={() => toggleRole(role)}
                >
                  <span>{form.targetRoles.includes(role) ? "✓" : "+"}</span>
                  {displayRole(role)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field grow">
            <span>실제로 전달할 업무 요청</span>
            <textarea
              placeholder="메신저나 기획서에 작성한 요청을 붙여 넣으세요. 구체적이지 않아도 괜찮습니다."
              value={form.brief}
              onChange={(event) => updateField("brief", event.target.value)}
            />
            <small>{form.brief.length} / 5,000</small>
          </label>

          <details className="advanced-options">
            <summary><span>＋</span> 일정·규정 등 반드시 지킬 조건 <em>선택</em></summary>
            <label className="field">
              <span>한 줄에 하나씩 입력하세요</span>
              <textarea
                className="constraint-input"
                placeholder={"예: 4주 내 출시\n예: 개인정보 최소 수집"}
                value={form.constraints.join("\n")}
                onChange={(event) =>
                  updateField(
                    "constraints",
                    event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                  )
                }
              />
            </label>
          </details>

          <button className="analyze-button" onClick={runAnalysis} disabled={loading || !canAnalyze}>
            <span className="button-icon">{loading ? "···" : "↗"}</span>
            <span>
              <strong>{loading ? "직무별 해석을 비교하는 중" : "직무 간 오해 검사하기"}</strong>
              <small>{canAnalyze ? "결과는 약 10초 안에 확인할 수 있어요" : "목표와 업무 요청을 조금 더 작성해 주세요"}</small>
            </span>
          </button>
          <p className="notice" role="status">
            <span>i</span>
            {notice}
          </p>
        </aside>

        <section id="analysis-results" className="results">
          <div className="result-overview">
            <div className="overview-copy">
              <div className="result-kicker">
                <span className="eyebrow">STEP 2 · 오해 가능성 확인</span>
                {isDirty ? (
                  <span className="example-badge stale">입력이 변경됨 · 다시 검사하세요</span>
                ) : isExample ? (
                  <span className="example-badge">예시 결과</span>
                ) : (
                  <span className="example-badge personal">내 분석 결과</span>
                )}
              </div>
              <div className="result-title-row">
                <h2>{analyzedRequest.projectName}</h2>
                <span className={`verdict ${analysis.verdict.toLowerCase()}`}>
                  {verdictLabels[analysis.verdict]}
                </span>
              </div>
              <p>{analysis.summary}</p>
              <div className="analysis-meta">
                <span>
                  {analysis.generationMode === "ai"
                    ? `AI 맞춤 분석 · ${analysis.meaningDiffs.length}건 동적 탐지`
                    : `체험 분석 · ${analysis.meaningDiffs.length}건 표준 탐지`}
                </span>
                <span>결과 번호 {analysis.analysisId.slice(0, 8)}</span>
                <span>즉시 확인 {criticalCount}건</span>
              </div>
              <button className="export-button" onClick={exportReport}>
                <span>↓</span> 분석 리포트 내보내기
              </button>
            </div>
            <div className="score-grid">
              <ScoreGauge label="의미 일치도" hint="높을수록 좋음" value={analysis.scores.alignment} />
              <ScoreGauge label="실행 준비도" hint="높을수록 좋음" value={analysis.scores.readiness} />
              <ScoreGauge label="오해 위험도" hint="낮을수록 좋음" value={analysis.scores.semanticRisk} inverse />
            </div>
          </div>

          <div className="result-body">
            <nav className="tabs" aria-label="분석 결과 진행 단계">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => moveToTab(index)}
                  aria-current={activeTab === tab.id ? "step" : undefined}
                >
                  <span className="tab-index">{index + 1}</span>
                  <span>{tab.label}</span>
                  {tab.id === "diff" && <em>{analysis.meaningDiffs.length}건</em>}
                </button>
              ))}
            </nav>
            <div className="tab-guide">
              <span>{activeTab === "diff" ? "먼저 확인" : `STEP ${activeTab === "lenses" ? "2" : "3"}`}</span>
              <div>
                <strong>{tabDescriptions[activeTab].title}</strong>
                <p>{tabDescriptions[activeTab].body}</p>
              </div>
            </div>
            <div className="tab-content">
              {activeTab === "diff" && (
                <>
                  <HandoffMap
                    source={analyzedRequest.sourceRole}
                    targets={analyzedRequest.targetRoles}
                    risk={analysis.scores.semanticRisk}
                  />
                  <MeaningDiffs items={analysis.meaningDiffs} />
                </>
              )}
              {activeTab === "lenses" && <RoleLenses items={analysis.roleLenses} />}
              {activeTab === "contract" && (
                <SharedContract sections={analysis.sharedContract} decisions={analysis.decisions} />
              )}
              {activeTab === "receipts" && (
                <Receipts
                  items={analysis.receiverReceipts}
                  confirmed={confirmedReceipts}
                  onConfirm={(role) =>
                    setConfirmedReceipts((current) =>
                      current.includes(role)
                        ? current.filter((item) => item !== role)
                        : [...current, role],
                    )
                  }
                />
              )}
              <div className="journey-actions" aria-label="결과 단계 이동">
                <button
                  type="button"
                  className="secondary-action"
                  disabled={activeTabIndex === 0}
                  onClick={() => moveToTab(activeTabIndex - 1)}
                >
                  ← 이전 단계
                </button>
                <div>
                  <small>{activeTabIndex + 1} / {tabs.length}</small>
                  <strong>{tabDescriptions[activeTab].title}</strong>
                </div>
                {activeTabIndex < tabs.length - 1 ? (
                  <button type="button" className="primary-action" onClick={() => moveToTab(activeTabIndex + 1)}>
                    다음 · {tabs[activeTabIndex + 1].label} →
                  </button>
                ) : (
                  <button type="button" className="primary-action" onClick={exportReport}>
                    결과 리포트 받기 ↓
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ScoreGauge({ label, hint, value, inverse = false }: { label: string; hint: string; value: number; inverse?: boolean }) {
  const tone = scoreTone(value, inverse);
  return (
    <div className={`score-card ${tone}`}>
      <div className="score-copy">
        <span>{label}</span>
        <small>{hint}</small>
      </div>
      <strong>{value}<small>/100</small></strong>
      <div className="score-track" aria-hidden="true">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function HandoffMap({ source, targets, risk }: { source: string; targets: string[]; risk: number }) {
  return (
    <section className="handoff-map" aria-label="인수인계 의미 흐름">
      <div className="map-node source-node">
        <small>요청을 보내는 사람</small>
        <span className="node-avatar">PM</span>
        <strong>{displayRole(source)}</strong>
      </div>
      <div className="map-path">
        <i />
        <span>원본 업무 요청</span>
      </div>
      <div className="meaning-gate">
        <div className="gate-pulse" />
        <small>오해 가능성 검사</small>
        <strong>위험도 {risk}점</strong>
        <span>보낸 의도 ≠ 받은 해석</span>
      </div>
      <div className="map-path right">
        <i />
        <span>확인된 실행안</span>
      </div>
      <div className="receiver-stack">
        {targets.map((role, index) => (
          <div className="map-node receiver-node" key={role} style={{ "--index": index } as React.CSSProperties}>
            <span className="node-avatar">{role.split(/\s|&/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2)}</span>
            <strong>{displayRole(role)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const labels: Record<Severity, string> = {
    critical: "즉시 확인",
    high: "중요",
    medium: "확인",
    low: "낮음",
  };
  return <span className={`severity ${severity}`}>{labels[severity]}</span>;
}

function MeaningDiffs({ items }: { items: AnalyzeResponse["meaningDiffs"] }) {
  return (
    <div className="diff-list">
      {items.map((item) => (
        <article className="diff-card" key={item.id}>
          <div className="diff-card-head">
            <div>
              <span className="diff-id">{item.id}</span>
              <h3>{item.category}</h3>
            </div>
            <SeverityBadge severity={item.severity} />
          </div>
          <blockquote>“{item.sourcePhrase}”</blockquote>
          <div className="meaning-compare">
            <div>
              <small>보낸 사람이 의도한 것</small>
              <p>{item.senderIntent}</p>
            </div>
            <span className="not-equal">≠</span>
            <div>
              <small>받는 사람이 다르게 이해할 수 있는 것</small>
              <p>{item.receiverInterpretation}</p>
            </div>
          </div>
          <div className="decision-callout">
            <span>결정 필요</span>
            <p>{item.requiredDecision}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function RoleLenses({ items }: { items: AnalyzeResponse["roleLenses"] }) {
  return (
    <div className="lens-grid">
      {items.map((item, index) => (
        <article className="lens-card" key={item.role}>
          <div className="lens-head">
            <span>0{index + 1}</span>
            <div>
              <small>직무별 관점</small>
              <h3>{displayRole(item.role)}</h3>
            </div>
          </div>
          <dl>
            <div><dt>이 직무가 중요하게 보는 것</dt><dd>{item.focus}</dd></div>
            <div><dt>요청을 이해한 방식</dt><dd>{item.interpretation}</dd></div>
            <div><dt>일을 시작하려면 필요한 정보</dt><dd>{item.needs.join(" · ")}</dd></div>
          </dl>
          <p className="risk-note"><span>!</span>{item.hiddenRisk}</p>
        </article>
      ))}
    </div>
  );
}

function SharedContract({
  sections,
  decisions,
}: {
  sections: AnalyzeResponse["sharedContract"];
  decisions: AnalyzeResponse["decisions"];
}) {
  return (
    <div className="contract-layout">
      <div className="contract-paper">
        <div className="contract-title">
          <div><span>STEP 3 · 팀에 전달할 최종 문서</span><h3>팀 실행 합의안</h3></div>
          <b>검토 중</b>
        </div>
        {sections.map((section) => (
          <section key={section.title}>
            <h4>{section.title}</h4>
            <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        ))}
      </div>
      <aside className="decision-ledger">
        <span className="eyebrow">아직 정해야 하는 것</span>
        <h3>시작 전 팀에서 답해 주세요</h3>
        {decisions.map((item) => (
          <div className="decision-item" key={item.id}>
            <div><b>{item.id}</b><span className={item.status}>{item.status === "open" ? "결정 필요" : item.status === "proposed" ? "제안됨" : "확정"}</span></div>
            <p>{item.question}</p>
            <small>{item.owner} · {item.due}</small>
          </div>
        ))}
      </aside>
    </div>
  );
}

function Receipts({
  items,
  confirmed,
  onConfirm,
}: {
  items: AnalyzeResponse["receiverReceipts"];
  confirmed: string[];
  onConfirm: (role: string) => void;
}) {
  return (
    <div className="receipt-list">
      {items.map((item) => {
        const isConfirmed = confirmed.includes(item.role);
        return (
        <article className={`receipt ${isConfirmed ? "confirmed" : ""}`} key={item.role}>
          <header>
            <div><small>업무를 받는 사람의 확인서</small><h3>{displayRole(item.role)}</h3></div>
            <div className="confidence"><strong>{item.confidence}%</strong><span>이해 확신도</span></div>
          </header>
          <div className="receipt-row"><span>이해한 목표</span><p>{item.understood}</p></div>
          <div className="receipt-row"><span>납품할 것</span><p>{item.willDeliver}</p></div>
          <div className="receipt-row missing"><span>부족한 정보</span><p>{item.missing}</p></div>
          <footer>
            <span>{isConfirmed ? "의미 확인 완료" : "수신 확인 대기"}</span>
            <button onClick={() => onConfirm(item.role)}>
              {isConfirmed ? "확인 취소" : "이해 확인 ✓"}
            </button>
          </footer>
        </article>
      )})}
    </div>
  );
}

export default App;
