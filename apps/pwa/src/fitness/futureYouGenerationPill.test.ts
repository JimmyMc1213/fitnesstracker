import { describe, expect, it } from "vitest";

import {
  buildFutureYouGenerationPillPhrases,
  futureYouGenerationPillCopy,
  FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
  FUTURE_YOU_GENERATION_PILL_READY_LABEL,
  isFutureYouGenerationPillVisible,
  isFutureYouReadyBannerVisible,
  shouldPollFutureYouGeneration,
} from "./futureYouGenerationPillModel";
import { parseFutureYouPollResponse } from "./futureYouPollService";

describe("futureYouGenerationPill", () => {
  it("shows pill for active photo-path jobs only", () => {
    expect(isFutureYouGenerationPillVisible({ photoSkipped: true, generationJobId: "a", generationStatus: "generating" })).toBe(
      false,
    );
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

describe("parseFutureYouPollResponse", () => {
  it("parses generating status without teaser or image URL", () => {
    expect(
      parseFutureYouPollResponse({
        jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        status: "generating",
        motivationId: "cut_m_veins",
        updatedAt: "2026-05-29T12:00:00.000Z",
      }),
    ).toEqual({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "generating",
      motivationId: "cut_m_veins",
      updatedAt: "2026-05-29T12:00:00.000Z",
    });
  });

  it("parses ready status with teaser metadata", () => {
    const response = parseFutureYouPollResponse({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "ready",
      motivationId: "cut_m_veins",
      updatedAt: "2026-05-29T12:00:00.000Z",
      teaser: {
        ready: true,
        motivationLabel: "Visible veins & definition",
        loadingPhrase: "Enhancing arm definition…",
      },
    });
    expect(response.teaser?.loadingPhrase).toBe("Enhancing arm definition…");
    expect(response.resultSignedUrl).toBeUndefined();
  });
});
