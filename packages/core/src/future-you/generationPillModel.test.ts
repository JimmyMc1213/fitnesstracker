import { describe, expect, it } from "vitest";

import {
  buildFutureYouGenerationPillPhrases,
  futureYouGenerationPillCopy,
  FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
  FUTURE_YOU_GENERATION_PILL_READY_LABEL,
  isFutureYouGenerationPillVisible,
  isFutureYouReadyBannerVisible,
  shouldPollFutureYouGeneration,
} from "./generationPillModel";

describe("futureYouGenerationPillModel", () => {
  it("shows pill for active photo-path jobs only", () => {
    expect(
      isFutureYouGenerationPillVisible({ photoSkipped: true, generationJobId: "a", generationStatus: "generating" }),
    ).toBe(false);
    expect(isFutureYouGenerationPillVisible({ generationJobId: "a", generationStatus: "idle" })).toBe(false);
    expect(
      isFutureYouGenerationPillVisible({
        generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        generationStatus: "generating",
      }),
    ).toBe(true);
    expect(
      isFutureYouGenerationPillVisible({
        generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        generationStatus: "ready",
      }),
    ).toBe(true);
  });

  it("stops polling once ready", () => {
    expect(
      shouldPollFutureYouGeneration(
        { generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", generationStatus: "generating" },
        true,
      ),
    ).toBe(true);
    expect(
      shouldPollFutureYouGeneration(
        { generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", generationStatus: "ready" },
        true,
      ),
    ).toBe(false);
  });

  it("puts selected motivation phrase first", () => {
    const phrases = buildFutureYouGenerationPillPhrases("cut_m_veins", "cut", "male");
    expect(phrases[0]).toBe("Enhancing arm definition…");
    expect(phrases.length).toBeGreaterThan(1);
  });

  it("uses ready copy when generation finished", () => {
    expect(
      futureYouGenerationPillCopy("ready", 0, ["Enhancing arm definition…"]).headline,
    ).toBe(FUTURE_YOU_GENERATION_PILL_READY_LABEL);
  });

  it("rotates creating sublines", () => {
    const phrases = ["A…", "B…"];
    expect(futureYouGenerationPillCopy("generating", 0, phrases)).toEqual({
      headline: FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
      subline: "A…",
      ready: false,
    });
    expect(futureYouGenerationPillCopy("generating", 1, phrases).subline).toBe("B…");
  });

  it("shows step 26 ready banner only for ready photo-path jobs", () => {
    const activeJob = {
      generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    };
    expect(isFutureYouReadyBannerVisible({ ...activeJob, photoSkipped: true }, "ready")).toBe(false);
    expect(isFutureYouReadyBannerVisible({ ...activeJob, generationStatus: "generating" }, "generating")).toBe(
      false,
    );
    expect(isFutureYouReadyBannerVisible(activeJob, "ready")).toBe(true);
    expect(isFutureYouReadyBannerVisible({ photoSkipped: true }, "ready")).toBe(false);
  });
});
