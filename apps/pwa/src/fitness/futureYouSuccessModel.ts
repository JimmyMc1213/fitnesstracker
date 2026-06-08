import type { FutureYouDraft } from "./futureYouDraft";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { isFutureYouPaywallHeroVisible } from "./futureYouPaywallModel";
import type { SubscriptionTier } from "./types";

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

/** Post-pay reveal uses the same hero rules as the paywall (photo path with active job). */
export function isFutureYouSuccessHeroVisible(
  futureYou: FutureYouDraft,
  photoBlocked: boolean,
): boolean {
  return isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
}

/** Step 28b only after stub subscribe; photo path also requires generation ready. */
export function canAccessFutureYouSuccessScreen(
  futureYou: FutureYouDraft,
  photoBlocked: boolean,
  status: FutureYouJobStatus | "idle",
  subscriptionTier: SubscriptionTier | null | undefined,
): boolean {
  if (subscriptionTier !== "pro") return false;
  if (!isFutureYouSuccessHeroVisible(futureYou, photoBlocked)) return true;
  return status === "ready";
}

export function isFutureYouPostPayEntitled(
  subscriptionTier: SubscriptionTier | null | undefined,
  previewMode: boolean,
): boolean {
  return previewMode || subscriptionTier === "pro";
}
