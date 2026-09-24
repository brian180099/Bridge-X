export default {
  fetch() {
    const provider = (process.env.LLM_PROVIDER ?? "openai").trim().toLowerCase();
    const hasApiKey = Boolean(
      process.env.OPENAI_API_KEY?.trim() ?? process.env.LLM_API_KEY?.trim(),
    );

    return Response.json({
      status: "ok",
      service: "operation-ai-api",
      aiMode: provider === "openai" && hasApiKey ? "available" : "demo",
      provider,
      timestamp: new Date().toISOString(),
    });
  },
};
