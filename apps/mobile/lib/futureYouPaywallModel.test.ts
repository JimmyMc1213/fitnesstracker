import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_PAYWALL_CTA_PREPARING,
  PAYWALL_CTA_START_MY_JOURNEY,
  PAYWALL_CTA_UNLOCK_NEWYOU,
  futureYouPaywallCtaLabel,
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

  it("labels paywall CTA for Future You vs plan-only paths", () => {
    expect(
      futureYouPaywallCtaLabel(
        { ...activeJob, generationStatus: "generating" },
        "generating",
        false,
      ),
    ).toBe(FUTURE_YOU_PAYWALL_CTA_PREPARING);
    expect(futureYouPaywallCtaLabel(activeJob, "ready", false)).toBe(PAYWALL_CTA_UNLOCK_NEWYOU);
    expect(futureYouPaywallCtaLabel(activeJob, "ready", false, "monthly")).toBe(PAYWALL_CTA_UNLOCK_NEWYOU);
    expect(futureYouPaywallCtaLabel({ photoSkipped: true }, "idle", false)).toBe(
      PAYWALL_CTA_START_MY_JOURNEY,
    );
    expect(futureYouPaywallCtaLabel({ photoSkipped: true }, "idle", false, "monthly")).toBe(
      PAYWALL_CTA_START_MY_JOURNEY,
    );
  });
});
