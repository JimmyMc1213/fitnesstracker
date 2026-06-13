import type { FutureYouDraft, FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";

import { isFutureYouPaywallHeroVisible } from "@/lib/futureYouPaywallModel";

export {
  FUTURE_YOU_SUCCESS_AI_LABEL,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  formatFutureYouSuccessHeadline,
  isFutureYouPostPayEntitled,
} from "@newyouai/core";

export function isFutureYouSuccessHeroVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
): boolean {
  if (!futureYou) return false;
  return isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
}

/** Step 28b only after subscribe; photo path also requires generation ready. */
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
