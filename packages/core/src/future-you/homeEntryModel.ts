import type { FutureYouDraft, SubscriptionTier } from "@newyouai/types";

import { isFutureYouSuccessHeroVisible } from "./successModel";
import { getFutureYouMotivationById } from "./motivations";

export type HomeFutureYouEntryMode = "reveal" | "upload_prompt";

export const HOME_FUTURE_YOU_CARD_TITLE = "NewYou";
export const HOME_FUTURE_YOU_UPLOAD_TITLE = "See your NewYou";
export const HOME_FUTURE_YOU_UPLOAD_SUBTITLE = "Add a photo to unlock your preview";

/** Whether Home should show a Future You entry after onboarding + subscribe. */
export function getHomeFutureYouEntryMode(
  futureYou: FutureYouDraft | undefined,
  photoBlocked: boolean,
  regionBlocked: boolean,
  subscriptionTier: SubscriptionTier | null | undefined,
  onboardingComplete: boolean,
): HomeFutureYouEntryMode | null {
  if (!onboardingComplete) return null;
  if (regionBlocked) return null;

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

export function homeFutureYouMotivationLabel(motivationId: string | undefined): string | null {
  if (!motivationId?.trim()) return null;
  return getFutureYouMotivationById(motivationId.trim())?.label ?? null;
}

export function homeFutureYouCardSubtitle(
  mode: HomeFutureYouEntryMode,
  timeline: string,
  motivationId: string | undefined,
): string {
  if (mode === "upload_prompt") return HOME_FUTURE_YOU_UPLOAD_SUBTITLE;
  const motivation = homeFutureYouMotivationLabel(motivationId);
  if (motivation) return `${timeline} · ${motivation}`;
  return `You in ${timeline}`;
}
