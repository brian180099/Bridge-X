import { analyzeWithOptionalAI } from "../apps/api/src/ai.js";
import { analyzeRequestSchema } from "../apps/api/src/types.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "INVALID_JSON", message: "요청 본문을 확인해 주세요." },
        { status: 400 },
      );
    }

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "INVALID_HANDOFF",
          message: "요청 내용을 다시 확인해 주세요.",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    return Response.json(await analyzeWithOptionalAI(parsed.data));
  },
};
