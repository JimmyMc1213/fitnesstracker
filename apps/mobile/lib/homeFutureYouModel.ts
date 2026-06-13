import type { FutureYouDraft, SubscriptionTier } from "@newyouai/types";

export type HomeFutureYouEntryMode = "reveal" | "upload_prompt";

function isFutureYouSuccessHeroVisible(draft: FutureYouDraft, photoBlocked: boolean): boolean {
  if (photoBlocked) return false;
  return draft.generationStatus === "ready" && Boolean(draft.photoStoragePath?.trim());
}

/** Whether Home should show a Future You entry after onboarding + subscribe. */
export function getHomeFutureYouEntryMode(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  subscriptionTier: SubscriptionTier | null | undefined,
  onboardingComplete: boolean,
): HomeFutureYouEntryMode | null {
  if (!onboardingComplete) return null;

  const draft = futureYou ?? {};
  const subscribed = subscriptionTier === "pro";
  const hasSavedFutureYou =
    isFutureYouSuccessHeroVisible(draft, photoBlocked) ||
    draft.photoSkipped === true ||
    photoBlocked ||
    draft.generationStatus === "failed";

  if (!subscribed && !hasSavedFutureYou) return null;

  if (isFutureYouSuccessHeroVisible(draft, photoBlocked)) {
    return "reveal";
  }

  if (draft.photoSkipped || photoBlocked || draft.generationStatus === "failed" || !futureYou) {
    return "upload_prompt";
  }

  if (subscribed) {
    return "upload_prompt";
  }

  return null;
}
