import "./env.js";
import cors from "cors";
import express from "express";
import { analyzeWithOptionalAI } from "./ai.js";
import { analyzeDeterministically } from "./analyzer.js";
import { sampleRequest } from "./sample.js";
import { analyzeRequestSchema } from "./types.js";
import { analyzeMeeting, transcribeAudio, meetingError } from './meetings.js';

export const app = express();

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
    service: "bridge-x-api",
    aiMode: provider === "openai" && hasApiKey ? "available" : "demo",
    provider,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/examples/global-product-handoff", (_request, response) => {
  response.json({ request: sampleRequest, analysis: analyzeDeterministically(sampleRequest) });
});

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
