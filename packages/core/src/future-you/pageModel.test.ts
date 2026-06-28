import { describe, expect, it } from "vitest";

import {
  canRedoFutureYouTransformation,
  formatDaysUntilFutureYouRedo,
  futureYouPageRedoLede,
  futureYouRedoAnchorIso,
  FUTURE_YOU_REDO_INTERVAL_MS,
  msUntilFutureYouRedoEligible,
  shouldPromptFutureYouReplaceDialog,
  shouldSkipFutureYouRedoCooldown,
} from "./pageModel";

describe("futureYouPageModel", () => {
  const readyAt = "2026-01-01T12:00:00.000Z";
  const twoWeeksLater = Date.parse(readyAt) + FUTURE_YOU_REDO_INTERVAL_MS + 1000;

  it("allows first transformation when not in reveal mode", () => {
    expect(canRedoFutureYouTransformation("upload_prompt", "idle", undefined)).toBe(true);
  });

  it("blocks upload during cooldown even after delete clears reveal mode", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    expect(canRedoFutureYouTransformation("upload_prompt", "idle", readyAt, false, oneWeekLater)).toBe(
      false,
    );
  });

  it("allows redo during cooldown when skipRedoCooldown is enabled", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    expect(
      canRedoFutureYouTransformation("reveal", "ready", readyAt, false, oneWeekLater, true),
    ).toBe(true);
    expect(
      shouldPromptFutureYouReplaceDialog("reveal", "ready", readyAt, false, oneWeekLater, true),
    ).toBe(true);
    expect(futureYouPageRedoLede(msUntilFutureYouRedoEligible(readyAt, oneWeekLater), true)).toBeNull();
  });

  it("skips redo cooldown when the active result was reported", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    const draft = {
      generationJobId: "job-reported",
      reportedJobId: "job-reported",
      generationReadyAt: readyAt,
      generationStatus: "ready" as const,
    };
    expect(shouldSkipFutureYouRedoCooldown(draft)).toBe(true);
    expect(
      canRedoFutureYouTransformation(
        "reveal",
        "ready",
        readyAt,
        false,
        oneWeekLater,
        shouldSkipFutureYouRedoCooldown(draft),
      ),
    ).toBe(true);
  });

  it("blocks redo until 14 days after ready", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    expect(canRedoFutureYouTransformation("reveal", "ready", readyAt, false, oneWeekLater)).toBe(false);
    expect(canRedoFutureYouTransformation("reveal", "ready", readyAt, false, twoWeeksLater)).toBe(true);
  });

  it("blocks redo when ready timestamp is not yet known", () => {
    expect(canRedoFutureYouTransformation("reveal", "ready", undefined, false)).toBe(false);
    expect(msUntilFutureYouRedoEligible(undefined)).toBe(FUTURE_YOU_REDO_INTERVAL_MS);
  });

  it("blocks redo while generation is in progress", () => {
    expect(canRedoFutureYouTransformation("reveal", "generating", readyAt, false, twoWeeksLater)).toBe(false);
  });

  it("prompts replace dialog only when redo is eligible", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    expect(shouldPromptFutureYouReplaceDialog("reveal", "ready", readyAt, false, oneWeekLater)).toBe(false);
    expect(shouldPromptFutureYouReplaceDialog("reveal", "ready", readyAt, false, twoWeeksLater)).toBe(true);
  });

  it("formats redo countdown lede for the gallery", () => {
    const oneWeekLater = Date.parse(readyAt) + 7 * 24 * 60 * 60 * 1000;
    expect(futureYouPageRedoLede(msUntilFutureYouRedoEligible(readyAt, oneWeekLater))).toBe(
      "You can upload again in 7 days.",
    );
    expect(futureYouPageRedoLede(0)).toBeNull();
  });

  it("formats remaining days for display", () => {
    expect(formatDaysUntilFutureYouRedo(msUntilFutureYouRedoEligible(readyAt, twoWeeksLater - 3 * 86400000))).toBe(
      "3 days",
    );
    const thirteenDaysAfterReady = Date.parse(readyAt) + 13 * 24 * 60 * 60 * 1000;
    expect(formatDaysUntilFutureYouRedo(msUntilFutureYouRedoEligible(readyAt, thirteenDaysAfterReady))).toBe(
      "one day",
    );
  });

  it("falls back to photo consent when ready timestamp is missing", () => {
    const consentAt = "2026-01-01T12:00:00.000Z";
    const thirteenDaysLater = Date.parse(consentAt) + 13 * 24 * 60 * 60 * 1000;
    expect(
      futureYouRedoAnchorIso({
        generationStatus: "ready",
        photoAiConsentAt: consentAt,
      }),
    ).toBe(consentAt);
    expect(
      formatDaysUntilFutureYouRedo(
        msUntilFutureYouRedoEligible(consentAt, thirteenDaysLater),
      ),
    ).toBe("one day");
  });
});
