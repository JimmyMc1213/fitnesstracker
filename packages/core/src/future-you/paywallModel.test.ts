import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_PAYWALL_CTA_DEFAULT,
  FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY,
  FUTURE_YOU_PAYWALL_CTA_PREPARING,
  ONBOARDING_FUTURE_YOU_CONTINUE_LABEL,
  ONBOARDING_PLAN_READY_CONTINUE_LABEL,
  futureYouPaywallCtaLabel,
  isFutureYouPaywallCtaEnabled,
  isFutureYouPaywallFailedVisible,
  isFutureYouPaywallHeroVisible,
  isPlanOnlyPaywallPath,
  onboardingPlanReadyContinueLabel,
} from "./paywallModel";

const activeJob = {
  generationJobId: "550e8400-e29b-41d4-a716-446655440000",
  generationStatus: "generating" as const,
};

describe("futureYouPaywallModel", () => {
  it("shows hero on photo path with an active job", () => {
    expect(isFutureYouPaywallHeroVisible(activeJob, false)).toBe(true);
  });

  it("hides hero when photo was skipped, blocked, or job failed", () => {
    expect(isFutureYouPaywallHeroVisible({ ...activeJob, photoSkipped: true }, false)).toBe(false);
    expect(isFutureYouPaywallHeroVisible(activeJob, true)).toBe(false);
    expect(isFutureYouPaywallHeroVisible({ ...activeJob, generationStatus: "failed" }, false)).toBe(false);
    expect(isFutureYouPaywallHeroVisible({}, false)).toBe(false);
  });

  it("shows failed recovery slot on photo path when job failed after auto-retry", () => {
    const failedAfterRetry = {
      ...activeJob,
      generationStatus: "failed" as const,
      generationAutoRetried: true,
    };
    expect(isFutureYouPaywallFailedVisible(failedAfterRetry, false)).toBe(true);
    expect(isFutureYouPaywallFailedVisible({ ...activeJob, generationStatus: "failed" }, false)).toBe(false);
    expect(isFutureYouPaywallFailedVisible({ ...failedAfterRetry, generationRetrying: true }, false)).toBe(false);
    expect(isFutureYouPaywallFailedVisible(activeJob, false)).toBe(false);
    expect(isFutureYouPaywallFailedVisible({ ...failedAfterRetry, generationStatus: "failed" }, true)).toBe(false);
    expect(isFutureYouPaywallFailedVisible({ photoSkipped: true, generationStatus: "failed" }, false)).toBe(
      false,
    );
  });

  it("disables CTA on photo path until generation is ready", () => {
    expect(isFutureYouPaywallCtaEnabled(activeJob, "generating", false)).toBe(false);
    expect(isFutureYouPaywallCtaEnabled(activeJob, "queued", false)).toBe(false);
    expect(isFutureYouPaywallCtaEnabled({ ...activeJob, generationStatus: "ready" }, "ready", false)).toBe(
      true,
    );
  });

  it("enables CTA immediately on skip, blocked, or failed paths", () => {
    expect(isFutureYouPaywallCtaEnabled({ photoSkipped: true }, "idle", false)).toBe(true);
    expect(isFutureYouPaywallCtaEnabled(activeJob, "generating", true)).toBe(true);
    expect(isFutureYouPaywallCtaEnabled({ ...activeJob, generationStatus: "failed", generationAutoRetried: true }, "failed", false)).toBe(
      true,
    );
  });

  it("labels CTA for preparing, ready, and plan-only paths", () => {
    expect(futureYouPaywallCtaLabel(activeJob, "generating", false)).toBe(FUTURE_YOU_PAYWALL_CTA_PREPARING);
    expect(futureYouPaywallCtaLabel({ ...activeJob, generationStatus: "ready" }, "ready", false)).toBe(
      FUTURE_YOU_PAYWALL_CTA_DEFAULT,
    );
    expect(
      futureYouPaywallCtaLabel({ ...activeJob, generationStatus: "ready" }, "ready", false, "monthly"),
    ).toBe(FUTURE_YOU_PAYWALL_CTA_DEFAULT);
    expect(futureYouPaywallCtaLabel({ photoSkipped: true }, "idle", false)).toBe(
      FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY,
    );
    expect(futureYouPaywallCtaLabel({ photoSkipped: true }, "idle", false, "monthly")).toBe(
      FUTURE_YOU_PAYWALL_CTA_DEFAULT,
    );
  });

  it("detects plan-only paywall paths", () => {
    expect(isPlanOnlyPaywallPath({ photoSkipped: true }, false)).toBe(true);
    expect(isPlanOnlyPaywallPath(activeJob, true)).toBe(true);
    expect(isPlanOnlyPaywallPath(activeJob, false)).toBe(false);
  });

  it("labels plan ready continue for skip vs photo paths", () => {
    expect(onboardingPlanReadyContinueLabel({ photoSkipped: true }, false)).toBe(
      ONBOARDING_PLAN_READY_CONTINUE_LABEL,
    );
    expect(onboardingPlanReadyContinueLabel(activeJob, false)).toBe(ONBOARDING_FUTURE_YOU_CONTINUE_LABEL);
    expect(onboardingPlanReadyContinueLabel(activeJob, true)).toBe(ONBOARDING_PLAN_READY_CONTINUE_LABEL);
  });
});
