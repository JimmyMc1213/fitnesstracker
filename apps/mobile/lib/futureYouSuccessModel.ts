import type { FutureYouDraft, FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";

import {
  canAccessFutureYouSuccessScreen as canAccessFutureYouSuccessScreenFromCore,
  FUTURE_YOU_SUCCESS_AI_LABEL,
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  formatFutureYouSuccessHeadline,
  isFutureYouPostPayEntitled,
  isFutureYouSuccessHeroVisible as isFutureYouSuccessHeroVisibleFromCore,
} from "@newyouai/core";

export {
  FUTURE_YOU_SUCCESS_AI_LABEL,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  formatFutureYouSuccessHeadline,
  isFutureYouPostPayEntitled,
};

export function isFutureYouSuccessHeroVisible(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
): boolean {
  if (!futureYou) return false;
  return isFutureYouSuccessHeroVisibleFromCore(futureYou, photoBlocked);
}

/** Step 28b after subscribe; photo path allows in-flight or failed generation. */
export function canAccessFutureYouSuccessScreen(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  status: FutureYouJobStatus | "idle",
  subscriptionTier: SubscriptionTier | null | undefined,
): boolean {
  if (!futureYou) return subscriptionTier === "pro";
  return canAccessFutureYouSuccessScreenFromCore(
    futureYou,
    photoBlocked,
    status,
    subscriptionTier,
  );
}
