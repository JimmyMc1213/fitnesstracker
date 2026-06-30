import type { FutureYouDraft, FutureYouJobStatus } from "@newyouai/types";

export {
  FUTURE_YOU_PAYWALL_CTA_TRIAL,
  FUTURE_YOU_PAYWALL_CTA_PREPARING,
  FUTURE_YOU_PAYWALL_CTA_DEFAULT,
  FUTURE_YOU_PAYWALL_CTA_PLAN_ONLY,
  ONBOARDING_PLAN_READY_CONTINUE_LABEL,
  ONBOARDING_FUTURE_YOU_CONTINUE_LABEL,
  isFutureYouPaywallHeroVisible,
  isFutureYouPaywallFailedVisible,
  isFutureYouPaywallCtaEnabled,
  isPlanOnlyPaywallPath,
  onboardingPlanReadyContinueLabel,
} from "@newyouai/core";

import {
  FUTURE_YOU_PAYWALL_CTA_PREPARING,
  isFutureYouPaywallHeroVisible,
  isPlanOnlyPaywallPath,
} from "@newyouai/core";

import type { PaywallBillingPeriod } from "@/lib/paywallPlans";

export const PAYWALL_CTA_UNLOCK_NEWYOU = "Unlock NewYou";
export const PAYWALL_CTA_START_MY_JOURNEY = "Start my journey";

/** RN paywall CTA: Future You path unlocks NewYou; skip/under-18 uses Start my journey. */
export function futureYouPaywallCtaLabel(
  futureYou: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
  photoBlocked: boolean,
  _billingPeriod: PaywallBillingPeriod = "yearly",
): string {
  if (isFutureYouPaywallHeroVisible(futureYou, photoBlocked) && status !== "ready") {
    return FUTURE_YOU_PAYWALL_CTA_PREPARING;
  }
  if (isPlanOnlyPaywallPath(futureYou, photoBlocked)) {
    return PAYWALL_CTA_START_MY_JOURNEY;
  }
  return PAYWALL_CTA_UNLOCK_NEWYOU;
}
