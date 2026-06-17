import type { FutureYouDraft } from "@newyouai/types";

import type { FutureYouJobStatus } from "./jobs";

export type FutureYouPaywallBillingPeriod = "monthly" | "yearly";

export const FUTURE_YOU_PAYWALL_CTA_TRIAL = "Unlock Future You";
export const FUTURE_YOU_PAYWALL_CTA_PREPARING = "Preparing your Future You…";
export const FUTURE_YOU_PAYWALL_CTA_DEFAULT = "Continue";
export const FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY = "Start My Journey";

export const ONBOARDING_PLAN_READY_CONTINUE_LABEL = "Unlock your plan";
export const ONBOARDING_FUTURE_YOU_CONTINUE_LABEL = "Continue to Future You";

/** Show blurred Future You hero on paywall (photo path with an active, non-failed job). */
export function isFutureYouPaywallHeroVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
): boolean {
  if (!futureYou || photoBlocked) return false;
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
): boolean {
  if (!isFutureYouPaywallHeroVisible(futureYou, photoBlocked)) return true;
  return status === "ready";
}

/** Skip photo, under-18, or failed generation — plan-forward paywall without Future You hero. */
export function isPlanOnlyPaywallPath(futureYou: FutureYouDraft | undefined, photoBlocked: boolean): boolean {
  return !isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
}

export function onboardingPlanReadyContinueLabel(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
): string {
  return isPlanOnlyPaywallPath(futureYou, photoBlocked)
    ? ONBOARDING_PLAN_READY_CONTINUE_LABEL
    : ONBOARDING_FUTURE_YOU_CONTINUE_LABEL;
}

export function futureYouPaywallCtaLabel(
  futureYou: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
  photoBlocked: boolean,
  billingPeriod: FutureYouPaywallBillingPeriod = "yearly",
): string {
  if (isFutureYouPaywallHeroVisible(futureYou, photoBlocked) && status !== "ready") {
    return FUTURE_YOU_PAYWALL_CTA_PREPARING;
  }
  if (billingPeriod === "monthly") {
    return FUTURE_YOU_PAYWALL_CTA_TRIAL;
  }
  if (isPlanOnlyPaywallPath(futureYou, photoBlocked)) {
    return FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY;
  }
  return FUTURE_YOU_PAYWALL_CTA_DEFAULT;
}
