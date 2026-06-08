import { describe, expect, it } from "vitest";

import { startFutureYouGeneration } from "./futureYouGenerateService";

describe("startFutureYouGeneration", () => {
  it("rejects when the user is not signed in or Supabase is unavailable", async () => {
    await expect(
      startFutureYouGeneration({
        sourcePath: "users/u1/source/a.jpg",
        motivationId: "cut_m_veins",
        profile: {
          goal: "cut",
          gender: "male",
          weightLbs: 190,
          goalWeightLbs: 175,
        },
        timeline: "3 months",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof Error &&
        error.name === "FutureYouGenerateError" &&
        "code" in error &&
        (error.code === "unavailable" || error.code === "auth_required"),
    );
  });
});
