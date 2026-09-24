import "./env.js";
import cors from "cors";
import express from "express";
import { analyzeWithOptionalAI } from "./ai.js";
import { analyzeDeterministically } from "./analyzer.js";
import { sampleRequest } from "./sample.js";
import { analyzeRequestSchema } from "./types.js";
import { analyzeMeeting, transcribeAudio, meetingError } from './meetings.js';
import { createProject, createRun, decideRun, type Project, type ProjectRun, type Decision } from "./orchestration.js";

export const app = express();
const projects = new Map<string, Project>();
const runs = new Map<string, ProjectRun>();

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.WEB_ORIGIN?.split(",").map((origin) => origin.trim()) ?? ["http://localhost:5173"],
  }),
);
app.use(express.json({ limit: "256kb" }));
app.post('/api/meeting-analyze', async (request, response) => {
  try { response.json(await analyzeMeeting(request.body)); }
  catch (error) { const failure = meetingError(error); response.status(failure.status).json(failure); }
});
app.post('/api/transcribe', express.raw({ type: 'audio/*', limit: '4mb' }), async (request, response) => {
  try { response.json(await transcribeAudio(request.body, request.headers['content-type'] || '')); }
  catch (error) { const failure = meetingError(error); response.status(failure.status).json(failure); }
});

app.get("/api/health", (_request, response) => {
  const provider = (process.env.LLM_PROVIDER ?? "openai").trim().toLowerCase();
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim() ?? process.env.LLM_API_KEY?.trim());
  response.json({
    status: "ok",
    service: "operation-ai-api",
    aiMode: provider === "openai" && hasApiKey ? "available" : "demo",
    provider,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/examples/global-product-handoff", (_request, response) => {
  response.json({ request: sampleRequest, analysis: analyzeDeterministically(sampleRequest) });
});

app.post("/api/projects", (request, response) => {
  const { name, goal, country, organization, finalApprover } = request.body ?? {};
  if (![name, goal, country, organization, finalApprover].every((value) => typeof value === "string" && value.trim())) {
    response.status(400).json({ error:"INVALID_PROJECT", message:"프로젝트 필수 정보를 입력해 주세요." }); return;
  }
  const project=createProject({name:name.trim(),goal:goal.trim(),country:country.trim(),organization:organization.trim(),finalApprover:finalApprover.trim()}); projects.set(project.id,project); response.status(201).json(project);
});
app.post("/api/projects/:id/run", (request,response) => { const project=projects.get(request.params.id); if(!project){response.status(404).json({error:"PROJECT_NOT_FOUND"});return;} const run=createRun(project); runs.set(run.id,run); response.status(201).json(run); });
app.post("/api/runs/:id/approve", (request,response) => { const run=runs.get(request.params.id); if(!run){response.status(404).json({error:"RUN_NOT_FOUND"});return;} const {decision,reason,approver}=request.body??{}; if(!["keep-8","change-10"].includes(decision)||!reason?.trim()){response.status(400).json({error:"INVALID_DECISION"});return;} const next=decideRun(run,decision as Decision,reason,approver||"최종 승인자");runs.set(next.id,next);response.json(next); });
app.post("/api/runs/:id/reject", (request,response) => { const run=runs.get(request.params.id); if(!run){response.status(404).json({error:"RUN_NOT_FOUND"});return;} const {decision="revise",reason,approver}=request.body??{}; if(!["revise","recheck","stop"].includes(decision)||!reason?.trim()){response.status(400).json({error:"INVALID_DECISION"});return;} const next=decideRun(run,decision as Decision,reason,approver||"최종 승인자");runs.set(next.id,next);response.json(next); });
app.get("/api/projects/:id/timeline", (request,response) => { const run=[...runs.values()].find(item=>item.projectId===request.params.id); if(!run){response.status(404).json({error:"TIMELINE_NOT_FOUND"});return;} response.json({project:projects.get(request.params.id),runId:run.id,status:run.status,events:run.audit}); });

app.post("/api/analyze", async (request, response) => {
  const parsed = analyzeRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: "INVALID_HANDOFF",
      message: "요청 내용을 다시 확인해 주세요.",
      issues: parsed.error.issues,
    });
    return;
  }

  const analysis = await analyzeWithOptionalAI(parsed.data);
  response.json(analysis);
});

app.use((_request, response) => {
  response.status(404).json({ error: "NOT_FOUND" });
});

export default app;
