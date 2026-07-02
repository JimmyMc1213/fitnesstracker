import type { FutureYouDraft } from "@newyouai/types";

import type { FutureYouJobStatus } from "./jobs";

export type FutureYouPaywallBillingPeriod = "monthly" | "yearly";

export const FUTURE_YOU_PAYWALL_CTA_TRIAL = "Unlock Future You";
export const FUTURE_YOU_PAYWALL_CTA_PREPARING = "Preparing your Future You…";
export const FUTURE_YOU_PAYWALL_CTA_DEFAULT = "Continue";
export const FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY = "Start My Journey";

export const ONBOARDING_PLAN_READY_CONTINUE_LABEL = "Unlock your plan";
export const ONBOARDING_FUTURE_YOU_CONTINUE_LABEL = "Continue to Future You";

function isFutureYouFeatureBlocked(photoBlocked: boolean, regionBlocked: boolean): boolean {
  return photoBlocked || regionBlocked;
}

/** True when the user is on the photo path with a failed generation job. */
export function isFutureYouPaywallFailedVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  regionBlocked: boolean = false,
): boolean {
  if (!futureYou || isFutureYouFeatureBlocked(photoBlocked, regionBlocked)) return false;
  if (futureYou.photoSkipped) return false;
  if (!futureYou.generationJobId?.trim()) return false;
  if (futureYou.generationRetrying) return false;
  if ((futureYou.generationStatus ?? "idle") !== "failed") return false;
  // Hide recovery until the one automatic retry has finished.
  return futureYou.generationAutoRetried === true;
}

/** Show blurred Future You hero on paywall (photo path with an active, non-failed job). */
export function isFutureYouPaywallHeroVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  regionBlocked: boolean = false,
): boolean {
  if (!futureYou || isFutureYouFeatureBlocked(photoBlocked, regionBlocked)) return false;
  if (futureYou.photoSkipped) return false;
  if (!futureYou.generationJobId?.trim()) return false;
  const status = futureYou.generationStatus ?? "idle";
  return status !== "failed";
}

/** Trial/pay CTA stays disabled on the photo path until generation is ready. */
export function isFutureYouPaywallCtaEnabled(
  futureYou: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
  photoBlocked: boolean,
  regionBlocked: boolean = false,
): boolean {
  if (!isFutureYouPaywallHeroVisible(futureYou, photoBlocked, regionBlocked)) return true;
  return status === "ready";
}

/** Skip photo, under-18, region-blocked, or failed generation — plan-forward paywall. */
export function isPlanOnlyPaywallPath(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  regionBlocked: boolean = false,
): boolean {
  return !isFutureYouPaywallHeroVisible(futureYou, photoBlocked, regionBlocked);
}

export function onboardingPlanReadyContinueLabel(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  regionBlocked: boolean = false,
): string {
  return isPlanOnlyPaywallPath(futureYou, photoBlocked, regionBlocked)
    ? ONBOARDING_PLAN_READY_CONTINUE_LABEL
    : ONBOARDING_FUTURE_YOU_CONTINUE_LABEL;
}

export function futureYouPaywallCtaLabel(
  futureYou: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
  photoBlocked: boolean,
  billingPeriod: FutureYouPaywallBillingPeriod = "yearly",
  regionBlocked: boolean = false,
): string {
  if (isFutureYouPaywallHeroVisible(futureYou, photoBlocked, regionBlocked) && status !== "ready") {
    return FUTURE_YOU_PAYWALL_CTA_PREPARING;
  }
  if (billingPeriod === "monthly") {
    return FUTURE_YOU_PAYWALL_CTA_DEFAULT;
  }
  if (isPlanOnlyPaywallPath(futureYou, photoBlocked, regionBlocked)) {
    return FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY;
  }
  return FUTURE_YOU_PAYWALL_CTA_DEFAULT;
}
