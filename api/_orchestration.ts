import { createProject, createRun, decideRun, type Decision, type Project, type ProjectRun } from "../apps/api/src/orchestration.js";

export const projects = new Map<string, Project>();
export const runs = new Map<string, ProjectRun>();
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Access-Control-Allow-Origin": "*" } });
export const options = () => new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
export async function body(request: Request) { try { return await request.json() as Record<string, unknown>; } catch { return {}; } }
export { createProject, createRun, decideRun };
export type { Decision, Project, ProjectRun };
