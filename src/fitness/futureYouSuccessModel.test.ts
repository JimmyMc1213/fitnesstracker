import { describe, expect, it } from "vitest";

import {
  canAccessFutureYouSuccessScreen,
  formatFutureYouSuccessHeadline,
  isFutureYouPostPayEntitled,
  isFutureYouSuccessHeroVisible,
} from "./futureYouSuccessModel";

const activeJob = {
  generationJobId: "550e8400-e29b-41d4-a716-446655440000",
  generationStatus: "ready" as const,
};

describe("futureYouSuccessModel", () => {
  it("mirrors paywall hero visibility on success", () => {
    expect(isFutureYouSuccessHeroVisible(activeJob, false)).toBe(true);
    expect(isFutureYouSuccessHeroVisible({ photoSkipped: true }, false)).toBe(false);
  });

  it("requires pro tier before success screen", () => {
    expect(canAccessFutureYouSuccessScreen(activeJob, false, "ready", null)).toBe(false);
    expect(canAccessFutureYouSuccessScreen(activeJob, false, "ready", "pro")).toBe(true);
    expect(canAccessFutureYouSuccessScreen({ photoSkipped: true }, false, "idle", "pro")).toBe(true);
  });

  it("requires ready generation on photo path", () => {
    expect(
      canAccessFutureYouSuccessScreen(
        { ...activeJob, generationStatus: "generating" },
        false,
        "generating",
        "pro",
      ),
    ).toBe(false);
  });

  it("treats preview mode as post-pay entitled", () => {
    expect(isFutureYouPostPayEntitled(null, true)).toBe(true);
    expect(isFutureYouPostPayEntitled("pro", false)).toBe(true);
    expect(isFutureYouPostPayEntitled(null, false)).toBe(false);
  });

  it("formats celebratory headline with display name", () => {
    expect(formatFutureYouSuccessHeadline("Jimmy")).toBe("You're ready, Jimmy.");
    expect(formatFutureYouSuccessHeadline("  Alex  ")).toBe("You're ready, Alex.");
    expect(formatFutureYouSuccessHeadline("")).toBe("You're ready, Friend.");
  });
});
