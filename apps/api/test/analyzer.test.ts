import request from "supertest";
import { describe, expect, it } from "vitest";
import { analyzeDeterministically } from "../src/analyzer.js";
import { app } from "../src/app.js";
import { sampleRequest } from "../src/sample.js";

describe("semantic handoff analyzer", () => {
  it("returns role-aware meaning gaps and a contract", () => {
    const result = analyzeDeterministically(sampleRequest);
    expect(result.verdict).toBe("REVISE");
    expect(result.meaningDiffs.length).toBeGreaterThanOrEqual(4);
    expect(result.roleLenses).toHaveLength(sampleRequest.targetRoles.length);
    expect(result.sharedContract.some((section) => section.title.includes("Definition of Done"))).toBe(true);
  });

  it("exposes health and validates handoff requests", async () => {
    const health = await request(app).get("/api/health");
    expect(health.status).toBe(200);
    expect(health.body.status).toBe("ok");

    const invalid = await request(app).post("/api/analyze").send({ projectName: "x" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toBe("INVALID_HANDOFF");
  });
});
