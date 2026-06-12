import type { FutureYouDraft, FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";

import { isFutureYouPaywallHeroVisible } from "@/lib/futureYouPaywallModel";

export const FUTURE_YOU_SUCCESS_AI_LABEL =
  "AI generated · Illustrative preview — not medical advice";

export const FUTURE_YOU_SUCCESS_WELCOME_PREFIX = "Welcome to ";
export const FUTURE_YOU_SUCCESS_WELCOME_BRAND = "NewYouAI";
export const FUTURE_YOU_SUCCESS_TAGLINE = "Your new chapter starts today.";
export const FUTURE_YOU_SUCCESS_CTA_LABEL = "Start My Journey";

export function formatFutureYouSuccessHeadline(displayName: string): string {
  const name = displayName.trim() || "Friend";
  return `You're ready, ${name}.`;
}

export function isFutureYouSuccessHeroVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
): boolean {
  if (!futureYou) return false;
  return isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
}

/** Step 28b only after subscribe; photo path also requires generation ready. */
export function isFutureYouPostPayEntitled(subscriptionTier: SubscriptionTier | null | undefined): boolean {
  return subscriptionTier === "pro";
}

export function canAccessFutureYouSuccessScreen(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  status: FutureYouJobStatus | "idle",
  subscriptionTier: SubscriptionTier | null | undefined,
): boolean {
  if (subscriptionTier !== "pro") return false;
  if (!futureYou || !isFutureYouSuccessHeroVisible(futureYou, photoBlocked)) return true;
  return status === "ready";
}
