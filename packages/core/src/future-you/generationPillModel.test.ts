import { describe, expect, it } from "vitest";

import {
  buildFutureYouGenerationPillPhrases,
  futureYouGenerationErrorMessage,
  futureYouGenerationPillCopy,
  FUTURE_YOU_GENERATION_FAILED_MESSAGE,
  FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
  FUTURE_YOU_GENERATION_PILL_RETRYING_LABEL,
  FUTURE_YOU_GENERATION_PILL_FAILED_LABEL,
  FUTURE_YOU_GENERATION_PILL_READY_LABEL,
  FUTURE_YOU_GENERATION_REFUSED_ERROR,
  FUTURE_YOU_GENERATION_REFUSED_MESSAGE,
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

  it("stops polling once terminal (ready or failed)", () => {
    expect(
      shouldPollFutureYouGeneration(
        { generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", generationStatus: "generating" },
        true,
      ),
    ).toBe(true);
    expect(
      shouldPollFutureYouGeneration(
        {
          generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
          generationStatus: "generating",
          generationRetrying: true,
        },
        true,
      ),
    ).toBe(false);
    expect(
      shouldPollFutureYouGeneration(
        { generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", generationStatus: "ready" },
        true,
      ),
    ).toBe(false);
    expect(
      shouldPollFutureYouGeneration(
        { generationJobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", generationStatus: "failed" },
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
    expect(futureYouGenerationPillCopy("ready", 0, ["Enhancing arm definition…"])).toEqual({
      headline: FUTURE_YOU_GENERATION_PILL_READY_LABEL,
      ready: true,
      failed: false,
    });
  });

  it("uses failed copy when generation failed", () => {
    const copy = futureYouGenerationPillCopy("failed", 0, ["Enhancing arm definition…"]);
    expect(copy.headline).toBe(FUTURE_YOU_GENERATION_PILL_FAILED_LABEL);
    expect(copy.ready).toBe(false);
    expect(copy.failed).toBe(true);
  });

  it("uses retrying copy while auto-retry is in flight", () => {
    expect(futureYouGenerationPillCopy("generating", 0, ["A…"], { retrying: true })).toEqual({
      headline: FUTURE_YOU_GENERATION_PILL_RETRYING_LABEL,
      ready: false,
      failed: false,
    });
  });

  it("rotates creating sublines", () => {
    const phrases = ["A…", "B…"];
    expect(futureYouGenerationPillCopy("generating", 0, phrases)).toEqual({
      headline: FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
      subline: "A…",
      ready: false,
      failed: false,
    });
    expect(futureYouGenerationPillCopy("generating", 1, phrases).subline).toBe("B…");
  });

  it("maps generation_refused to user-friendly copy", () => {
    expect(futureYouGenerationErrorMessage(FUTURE_YOU_GENERATION_REFUSED_ERROR)).toBe(
      FUTURE_YOU_GENERATION_REFUSED_MESSAGE,
    );
    expect(futureYouGenerationErrorMessage("Generation timed out. Try again.")).toBe(
      FUTURE_YOU_GENERATION_FAILED_MESSAGE,
    );
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
