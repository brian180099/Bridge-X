import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  calendarFile,
  download,
  markdownFile,
  type Meeting,
  type Task,
} from "./meeting-model";
import "./meeting.css";

const KEY = "bridge-x-meetings-v1";
function read(): Meeting[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data)
      ? data.filter(
          (m) =>
            m.id &&
            Array.isArray(m.tasks) &&
            Array.isArray(m.ambiguities) &&
            Array.isArray(m.glossary),
        )
      : [];
  } catch {
    return [];
  }
}
const sample = {
  title: "결제 개선 주간 회의",
  domain: "전자상거래 · 결제",
  participants: "재웅: PM\n지민: 디자인\n민수: 개발",
  context: "한국 팀 내부 회의. MVP의 범위와 출시 조건을 확인합니다.",
  transcript:
    "재웅: 이번 MVP는 빠르게 내고 싶어요. 가입 없이 결제할 수 있게 합시다.\n지민: 빠르게라는 게 디자인 시안만 먼저 전달하는 건가요? 실패했을 때 화면도 필요해요. 제가 결제 성공과 실패 화면을 정리하겠습니다.\n민수: 저는 인증 API 확인부터 해야 합니다. 인증이 필요하면 가입 없이 결제한다는 조건과 충돌할 수 있어요. 제가 API 조건을 확인하겠습니다.\n재웅: 그럼 외부 출시는 인증 조건을 확인한 후 결정합시다. 제가 MVP 포함 범위를 문서로 정리하겠습니다. 성공 지표와 날짜는 다음 회의에서 결정하죠.",
};
export default function MeetingApp() {
  const [meetings, setMeetings] = useState<Meeting[]>(read);
  const [notice, setNotice] = useState("");
  const save = (next: Meeting[]) => {
    setMeetings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setNotice("");
    } catch {
      setNotice(
        "브라우저 저장 공간이 부족합니다. 현재 탭에서는 계속 사용할 수 있습니다. 내보내기로 보관해 주세요.",
      );
    }
  };
  return (
    <BrowserRouter>
      <div className="meeting-shell">
        <aside>
          <Link className="meeting-brand" to="/">
            Bridge <b>X</b>
          </Link>
          <p className="muted">회의의 맥락을 실행으로</p>
          <nav>
            <NavLink to="/" end>
              회의 목록
            </NavLink>
            <NavLink to="/meetings/new">＋ 새 회의</NavLink>
            <NavLink to="/tasks">모든 할 일</NavLink>
            <NavLink to="/connections">연결·내보내기</NavLink>
          </nav>
          <small>
            개인 작업 공간
            <br />이 브라우저에 저장됩니다.
          </small>
        </aside>
        <main>
          {notice && (
            <p role="alert" className="meeting-alert">
              {notice}
            </p>
          )}
          <Routes>
            <Route path="/" element={<MeetingHome meetings={meetings} />} />
            <Route
              path="/meetings/new"
              element={<CreateMeeting add={(m) => save([m, ...meetings])} />}
            />
            <Route
              path="/meetings/:id"
              element={
                <MeetingDetail
                  meetings={meetings}
                  update={(m) =>
                    save(meetings.map((x) => (x.id === m.id ? m : x)))
                  }
                />
              }
            />
            <Route path="/tasks" element={<AllTasks meetings={meetings} />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="*" element={<MeetingHome meetings={meetings} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
function MeetingHome({ meetings }: { meetings: Meeting[] }) {
  const [query, setQuery] = useState("");
  return (
    <>
      <header className="meeting-heading">
        <div>
          <span className="eyebrow">MEETING WORKSPACE</span>
          <h1>
            회의가 끝나면,
            <br />
            다음 할 일이 명확하게.
          </h1>
          <p>회의를 기록하고 직무별 업무와 확인할 표현을 함께 정리하세요.</p>
        </div>
        <Link className="button primary" to="/meetings/new">
          ＋ 회의 기록하기
        </Link>
      </header>
      <div className="meeting-stats">
        <div>
          <b>{meetings.length}</b>기록한 회의
        </div>
        <div>
          <b>
            {meetings.flatMap((m) => m.tasks).filter((t) => !t.reviewed).length}
          </b>
          검토할 업무
        </div>
        <div>
          <b>
            {
              meetings
                .flatMap((m) => m.tasks)
                .filter((t) => t.reviewed && !t.completed).length
            }
          </b>
          진행할 업무
        </div>
      </div>
      <div className="meeting-toolbar">
        <h2>회의 기록</h2>
        <input
          aria-label="회의 검색"
          placeholder="회의 이름으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {!meetings.length ? (
        <div className="meeting-empty">
          <h2>첫 회의를 기록해 보세요</h2>
          <p>
            마이크 녹음, 음성 파일, 회의록 붙여넣기 중 편한 방법을 선택할 수
            있습니다.
          </p>
          <Link className="button primary" to="/meetings/new">
            회의 시작 →
          </Link>
        </div>
      ) : (
        <div className="meeting-list">
          {meetings
            .filter((m) => m.title.includes(query))
            .map((m) => (
              <Link key={m.id} to={"/meetings/" + m.id}>
                <div>
                  <small>
                    {m.domain} ·{" "}
                    {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                  </small>
                  <h2>{m.title}</h2>
                  <p>{m.summary}</p>
                </div>
                <span>
                  할 일 {m.tasks.length} · 확인 질문 {m.ambiguities.length} →
                </span>
              </Link>
            ))}
        </div>
      )}
    </>
  );
}
function CreateMeeting({ add }: { add: (m: Meeting) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("meeting-draft") || "null") || {
          title: "",
          domain: "제품 개발",
          participants: "",
          context: "",
          transcript: "",
        }
      );
    } catch {
      return {
        title: "",
        domain: "제품 개발",
        participants: "",
        context: "",
        transcript: "",
      };
    }
  });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [consent, setConsent] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  useEffect(() => {
    try {
      sessionStorage.setItem("meeting-draft", JSON.stringify(form));
    } catch {}
  }, [form]);
  useEffect(
    () => () => {
      if (recorder.current) {
        recorder.current.onstop = null;
        if (recorder.current.state === "recording") recorder.current.stop();
      }
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);
  useEffect(() => {
    if (!audio) return;
    const next = URL.createObjectURL(audio);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [audio]);
  const field = (key: string, value: string) =>
    setForm((old: typeof form) => ({ ...old, [key]: value }));
  async function start() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          "이 브라우저는 녹음을 지원하지 않습니다. 음성 파일을 업로드해 주세요.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mime = ["audio/webm", "audio/mp4"].find((t) =>
        MediaRecorder.isTypeSupported(t),
      );
      const rec = new MediaRecorder(
        stream.current,
        mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined,
      );
      recorder.current = rec;
      const chunks: Blob[] = [];
      let size = 0;
      rec.ondataavailable = (e) => {
        chunks.push(e.data);
        size += e.data.size;
        if (size > 3_800_000 && rec.state === "recording") rec.stop();
      };
      rec.onstop = () => {
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setAudio(new Blob(chunks, { type: rec.mimeType }));
      };
      rec.start(1000);
      setSeconds(0);
      setRecording(true);
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError(e instanceof Error ? e.message : "마이크 접근에 실패했습니다.");
    }
  }
  async function transcribe() {
    if (!audio) return;
    if (audio.size > 4_000_000) {
      setError(
        "현재 음성 파일은 4MB까지 지원합니다. 짧게 나누어 업로드해 주세요.",
      );
      return;
    }
    setBusy("음성을 글로 변환하고 있습니다…");
    setError("");
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": audio.type || "audio/mpeg" },
        body: audio,
        signal: AbortSignal.timeout(60000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "전사 실패");
      field(
        "transcript",
        form.transcript + (form.transcript ? "\n" : "") + result.text,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "전사 실패");
    } finally {
      setBusy("");
    }
  }
  async function analyze() {
    setBusy("직무별 업무와 오해 가능 표현을 분석하고 있습니다…");
    setError("");
    try {
      const response = await fetch("/api/meeting-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(60000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "분석 실패");
      const m = {
        ...form,
        ...result,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      add(m);
      sessionStorage.removeItem("meeting-draft");
      navigate("/meetings/" + m.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 실패");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <header className="meeting-heading">
        <div>
          <span className="eyebrow">NEW MEETING</span>
          <h1>회의 기록하기</h1>
          <p>
            기록을 준비한 뒤 내용을 확인하고 분석하세요. 입력 중인 내용은 현재
            탭에 임시 저장됩니다.
          </p>
        </div>
        <button
          className="button"
          disabled={!!busy || recording}
          onClick={() => setForm(sample)}
        >
          예시 입력
        </button>
      </header>
      <fieldset
        disabled={!!busy || recording}
        className="meeting-panel meeting-form"
      >
        <h2>1. 회의 맥락</h2>
        <div className="meeting-fields">
          <label>
            회의 이름
            <input
              maxLength={120}
              value={form.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="예: 제품 출시 주간 회의"
            />
          </label>
          <label>
            도메인
            <input
              maxLength={120}
              value={form.domain}
              onChange={(e) => field("domain", e.target.value)}
              placeholder="예: 이커머스·의료·교육"
            />
          </label>
        </div>
        <label>
          참여자와 직무
          <textarea
            maxLength={2000}
            rows={2}
            value={form.participants}
            onChange={(e) => field("participants", e.target.value)}
            placeholder="예: 재웅: PM / 지민: 디자인 / 민수: 개발"
          />
        </label>
        <label>
          언어·협업 맥락 <small>선택</small>
          <input
            maxLength={2000}
            value={form.context}
            onChange={(e) => field("context", e.target.value)}
            placeholder="사용 언어, 팀에서 특별히 사용하는 용어 등을 적어주세요."
          />
        </label>
      </fieldset>
      <section className="meeting-panel">
        <h2>2. 녹음하거나 파일을 올리세요</h2>
        <p className="muted">
          마이크 주변 소리를 녹음합니다. 온라인 회의 상대방 소리 자동 수집·화자
          자동 구분은 아직 지원하지 않습니다. 파일당 최대 4MB.
        </p>
        <label className="meeting-check">
          <input
            type="checkbox"
            checked={consent}
            disabled={recording || !!busy}
            onChange={(e) => setConsent(e.target.checked)}
          />
          참여자에게 녹음·AI 처리를 알리고 동의를 받았습니다.
        </label>
        <div className="meeting-toolbar">
          <button
            className="button primary"
            disabled={!consent || !!busy}
            onClick={() => (recording ? recorder.current?.stop() : start())}
          >
            {recording ? "■ 녹음 종료 · " + seconds + "초" : "● 마이크 녹음"}
          </button>
          <label className="button upload-label">
            음성 파일 선택
            <input
              type="file"
              accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg,.m4a"
              disabled={!consent || recording || !!busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setAudio(f);
                  setError("");
                }
              }}
            />
          </label>
        </div>
        {audio && (
          <div className="audio-preview">
            <audio controls src={url} />
            <span>{(audio.size / 1_000_000).toFixed(2)} MB</span>
            <button
              className="button"
              disabled={!consent || !!busy || recording}
              onClick={transcribe}
            >
              전사 내용 추가
            </button>
          </div>
        )}
      </section>
      <section className="meeting-panel meeting-form">
        <h2>3. 회의 내용을 확인하세요</h2>
        <p className="muted">
          전사 오류를 수정하거나 회의록을 직접 붙여 넣으세요. 화자 이름을 붙이면
          담당자를 더 정확히 찾을 수 있습니다.
        </p>
        <textarea
          aria-label="회의 내용"
          rows={10}
          maxLength={40000}
          value={form.transcript}
          disabled={!!busy || recording}
          onChange={(e) => field("transcript", e.target.value)}
          placeholder="재웅: 제가 요구사항을 정리하겠습니다…"
        />
        <small>
          {form.transcript.length.toLocaleString()} / 40,000자 · 최소 30자
        </small>
      </section>
      {error && (
        <p role="alert" className="meeting-alert">
          {error}
        </p>
      )}
      <div className="meeting-submit">
        <p role="status">
          {busy ||
            "AI 결과는 제안입니다. 분석 후 담당자와 기한을 검토해 주세요."}
        </p>
        <button
          className="button primary"
          disabled={
            !!busy ||
            recording ||
            form.title.trim().length < 2 ||
            form.participants.trim().length < 2 ||
            form.transcript.trim().length < 30
          }
          onClick={analyze}
        >
          회의 분석하기 →
        </button>
      </div>
    </>
  );
}

function MeetingDetail({
  meetings,
  update,
}: {
  meetings: Meeting[];
  update: (m: Meeting) => void;
}) {
  const { id } = useParams();
  const m = meetings.find((x) => x.id === id);
  const [tab, setTab] = useState("tasks");
  const [role, setRole] = useState("");
  if (!m)
    return (
      <div className="meeting-empty">
        <h1>이 브라우저에 회의 기록이 없습니다</h1>
        <Link to="/">회의 목록으로</Link>
      </div>
    );
  const patch = (index: number, value: Partial<Task>) =>
    update({
      ...m,
      tasks: m.tasks.map((t, i) => (i === index ? { ...t, ...value } : t)),
    });
  const tabs = [
    ["tasks", "할 일", m.tasks.length],
    ["ambiguities", "확인할 표현", m.ambiguities.length],
    ["glossary", "용어 가이드", m.glossary.length],
    ["notes", "요약·원문", ""],
  ];
  return (
    <>
      <Link className="muted" to="/">
        ← 회의 목록
      </Link>
      <header className="meeting-heading">
        <div>
          <span className="eyebrow">{m.domain}</span>
          <h1>{m.title}</h1>
          <p>{m.summary}</p>
        </div>
      </header>
      <nav className="meeting-tabs">
        {tabs.map(([key, label, count]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(String(key))}
          >
            {label} <small>{count}</small>
          </button>
        ))}
      </nav>
      {tab === "tasks" && (
        <>
          <div className="meeting-toolbar">
            <select
              aria-label="직무 필터"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">모든 직무</option>
              {[...new Set(m.tasks.map((t) => t.role))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <span className="muted">
              담당자·기한·우선순위를 수정한 뒤 검토 완료를 체크하세요.
            </span>
          </div>
          {!m.tasks.length && (
            <div className="meeting-empty">
              명시된 할 일이 없습니다. 원문을 확인해 주세요.
            </div>
          )}
          {m.tasks
            .map((task, index) => ({ task, index }))
            .filter(({ task }) => !role || task.role === role)
            .sort((a, b) => a.task.priority.localeCompare(b.task.priority))
            .map(({ task: t, index }) => (
              <article className="meeting-panel task-card" key={index}>
                <div className="task-top">
                  <span className={"priority " + t.priority}>{t.priority}</span>
                  <span>{t.role}</span>
                  <span className="task-state">
                    {t.reviewed ? "검토 완료" : "AI 제안 · 검토 필요"}
                  </span>
                </div>
                <label className="task-title">
                  업무
                  <input
                    value={t.title}
                    onChange={(e) =>
                      patch(index, { title: e.target.value, reviewed: false })
                    }
                  />
                </label>
                <div className="meeting-fields">
                  <label>
                    담당자
                    <input
                      value={t.owner}
                      onChange={(e) =>
                        patch(index, { owner: e.target.value, reviewed: false })
                      }
                    />
                  </label>
                  <label>
                    기한
                    <input
                      type="date"
                      value={t.due}
                      onInput={(e) =>
                        patch(index, { due: e.currentTarget.value, reviewed: false })
                      }
                      onBlur={(e) => {
                        if (e.currentTarget.value !== t.due)
                          patch(index, { due: e.currentTarget.value, reviewed: false });
                      }}
                      onChange={(e) =>
                        patch(index, { due: e.target.value, reviewed: false })
                      }
                    />
                  </label>
                  <label>
                    우선순위
                    <select
                      value={t.priority}
                      onChange={(e) =>
                        patch(index, {
                          priority: e.target.value as Task["priority"],
                          reviewed: false,
                        })
                      }
                    >
                      <option>P1</option>
                      <option>P2</option>
                      <option>P3</option>
                    </select>
                  </label>
                </div>
                <p>
                  <b>추천 근거</b> {t.reason}
                </p>
                <p>
                  <b>선행 조건</b> {t.dependency || "명시되지 않음"}
                </p>
                <label>
                  완료 기준
                  <textarea
                    rows={2}
                    value={t.doneWhen}
                    onChange={(e) =>
                      patch(index, {
                        doneWhen: e.target.value,
                        reviewed: false,
                      })
                    }
                  />
                </label>
                <details>
                  <summary>근거 발언 보기</summary>
                  <blockquote>
                    {t.evidence ||
                      "정확한 인용을 확인하지 못했습니다. 원문을 검토해 주세요."}
                  </blockquote>
                </details>
                <div className="meeting-toolbar">
                  <label className="meeting-check">
                    <input
                      type="checkbox"
                      checked={!!t.reviewed}
                      onChange={(e) =>
                        patch(index, { reviewed: e.target.checked })
                      }
                    />
                    내 검토 완료
                  </label>
                  <label className="meeting-check">
                    <input
                      type="checkbox"
                      checked={!!t.completed}
                      onChange={(e) =>
                        patch(index, { completed: e.target.checked })
                      }
                    />
                    업무 완료
                  </label>
                </div>
              </article>
            ))}
          <ExportPanel meeting={m} />
        </>
      )}
      {tab === "ambiguities" && (
        <>
          <p className="muted">
            아래 해석은 AI가 제안한 가능성입니다. 참여자의 실제 의도는 질문으로
            확인하세요.
          </p>
          {!m.ambiguities.length && (
            <div className="meeting-empty">
              특별한 오해 가능 표현을 찾지 못했습니다.
            </div>
          )}
          {m.ambiguities.map((a, i) => (
            <article className="meeting-panel" key={i}>
              <h2>“{a.phrase}”</h2>
              <p>{a.interpretations}</p>
              <div className="meeting-question">
                <b>함께 확인할 질문</b>
                <p>{a.question}</p>
              </div>
              <p>
                <b>명확한 표현 제안</b> {a.suggestion}
              </p>
            </article>
          ))}
        </>
      )}
      {tab === "glossary" && (
        <>
          {!m.glossary.length && (
            <div className="meeting-empty">
              설명이 필요한 용어를 찾지 못했습니다.
            </div>
          )}
          {m.glossary.map((g, i) => (
            <article className="meeting-panel" key={i}>
              <h2>{g.term}</h2>
              <p>{g.explanation}</p>
              <p className="meeting-question">{g.caution}</p>
            </article>
          ))}
        </>
      )}
      {tab === "notes" && (
        <>
          <section className="meeting-panel">
            <h2>결정 사항</h2>
            {m.decisions.length ? (
              m.decisions.map((d, i) => <p key={i}>✓ {d}</p>)
            ) : (
              <p>명시적으로 확정된 결정이 없습니다.</p>
            )}
          </section>
          <section className="meeting-panel">
            <h2>참여자·협업 맥락</h2>
            <p className="prewrap">{m.participants}</p>
            <p>{m.context}</p>
          </section>
          <section className="meeting-panel">
            <h2>회의 원문</h2>
            <p className="prewrap">{m.transcript}</p>
          </section>
        </>
      )}
    </>
  );
}
function ExportPanel({ meeting: m }: { meeting: Meeting }) {
  return (
    <section className="meeting-panel">
      <h2>확정한 업무를 가져가세요</h2>
      <p className="muted">
        내 검토 완료 항목만 내보냅니다. 캘린더 파일에는 날짜가 지정된 업무만
        포함됩니다. 자동 동기화는 아닙니다.
      </p>
      <div className="meeting-toolbar">
        <button
          className="button"
          disabled={!m.tasks.some((t) => t.reviewed && t.due)}
          onClick={() =>
            download(
              calendarFile(m),
              "bridge-x.ics",
              "text/calendar;charset=utf-8",
            )
          }
        >
          캘린더 파일 (.ics)
        </button>
        <button
          className="button"
          disabled={!m.tasks.some((t) => t.reviewed)}
          onClick={() =>
            download(
              markdownFile(m),
              "bridge-x.md",
              "text/markdown;charset=utf-8",
            )
          }
        >
          Notion 가져오기용 (.md)
        </button>
      </div>
    </section>
  );
}
function AllTasks({ meetings }: { meetings: Meeting[] }) {
  return (
    <>
      <header className="meeting-heading">
        <div>
          <h1>모든 할 일</h1>
          <p>작은 회의에서 나온 업무를 한곳에서 확인하세요.</p>
        </div>
      </header>
      <div className="meeting-list">
        {meetings.flatMap((m) =>
          m.tasks.map((t, i) => (
            <Link key={m.id + i} to={"/meetings/" + m.id}>
              <div>
                <small>
                  {m.title} · {t.role}
                </small>
                <h2>
                  {t.completed ? "✓ " : ""}
                  {t.title}
                </h2>
                <p>
                  {t.owner} · {t.due || "기한 미정"} ·{" "}
                  {t.reviewed ? "검토 완료" : "검토 필요"}
                </p>
              </div>
              <span className={"priority " + t.priority}>{t.priority}</span>
            </Link>
          )),
        )}
        {!meetings.some((m) => m.tasks.length) && (
          <div className="meeting-empty">
            회의를 분석하면 할 일이 표시됩니다.
          </div>
        )}
      </div>
    </>
  );
}
function Connections() {
  return (
    <>
      <header className="meeting-heading">
        <div>
          <h1>연결·내보내기</h1>
          <p>지원하는 방식과 준비 중인 연동을 확인하세요.</p>
        </div>
      </header>
      <section className="meeting-panel">
        <h2>캘린더 · 파일 가져오기 지원</h2>
        <p>
          회의 상세에서 검토를 마친 업무에 날짜를 지정하고 .ics 파일을 받으세요.
          사용하는 캘린더의 가져오기 기능으로 등록할 수 있습니다.
        </p>
      </section>
      <section className="meeting-panel">
        <h2>Notion · 문서 가져오기 지원</h2>
        <p>
          회의 상세에서 Markdown 파일을 받은 뒤 Notion의 가져오기 기능을
          사용하세요. 업무 목록과 결정 사항이 문서로 들어갑니다.
        </p>
      </section>
      <section className="meeting-panel">
        <h2>다음 개발 항목</h2>
        <ul>
          <li>Notion 데이터베이스 직접 생성·동기화</li>
          <li>Google Calendar 계정 연결·일정 직접 등록</li>
          <li>팀 공유 저장소와 팀원별 실제 승인</li>
          <li>긴 녹음 파일 분할 업로드 및 화자 자동 구분</li>
        </ul>
        <p className="muted">
          현재 기록은 이 브라우저에만 저장됩니다. 다른 사람에게 주소만 보내면
          회의 내용이 공유되지 않습니다.
        </p>
      </section>
    </>
  );
}
