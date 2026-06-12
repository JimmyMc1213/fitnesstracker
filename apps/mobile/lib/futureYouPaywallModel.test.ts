import { describe, expect, it } from "vitest";

import {
  isFutureYouPaywallCtaEnabled,
  isFutureYouPaywallHeroVisible,
  isPlanOnlyPaywallPath,
} from "./futureYouPaywallModel";

const activeJob = {
  generationJobId: "550e8400-e29b-41d4-a716-446655440000",
  generationStatus: "ready" as const,
};

describe("futureYouPaywallModel", () => {
  it("shows hero on photo path with active job", () => {
    expect(isFutureYouPaywallHeroVisible(activeJob, false)).toBe(true);
    expect(isFutureYouPaywallHeroVisible({ photoSkipped: true }, false)).toBe(false);
    expect(isFutureYouPaywallHeroVisible(activeJob, true)).toBe(false);
  });

  it("disables CTA until generation ready on photo path", () => {
    expect(isFutureYouPaywallCtaEnabled(activeJob, "ready", false)).toBe(true);
    expect(isFutureYouPaywallCtaEnabled(activeJob, "generating", false)).toBe(false);
    expect(isFutureYouPaywallCtaEnabled({ photoSkipped: true }, "idle", false)).toBe(true);
  });

  it("uses plan-only path when hero hidden", () => {
    expect(isPlanOnlyPaywallPath({ photoSkipped: true }, false)).toBe(true);
    expect(isPlanOnlyPaywallPath(activeJob, false)).toBe(false);
  });
});
