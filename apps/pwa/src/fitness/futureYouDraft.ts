import type { FutureYouDraft, FutureYouPreview } from "@newyouai/types";
import {
  EMPTY_FUTURE_YOU_DRAFT,
  futureYouDraftAfterPreviewDelete,
  isFutureYouMediaCleared,
  mergeFutureYouDraft,
  normalizeFutureYouDraft,
} from "@newyouai/core";

export type { FutureYouDraft, FutureYouPreview };
export {
  EMPTY_FUTURE_YOU_DRAFT,
  futureYouDraftAfterPreviewDelete,
  isFutureYouMediaCleared,
  mergeFutureYouDraft,
  normalizeFutureYouDraft,
};

/** Photo + motivation fields preserved when replacing an existing preview. */
export function futureYouUploadSnapshot(draft: FutureYouDraft): FutureYouDraft {
  const snap: FutureYouDraft = { photoSkipped: false };
  if (draft.photoUploaded === true) snap.photoUploaded = true;
  if (draft.photoAiConsentAt?.trim()) snap.photoAiConsentAt = draft.photoAiConsentAt.trim();
  if (draft.photoStoragePath?.trim()) snap.photoStoragePath = draft.photoStoragePath.trim();
  if (draft.motivationId?.trim()) snap.motivationId = draft.motivationId.trim();
  if (draft.motivationIsGeneric === true) snap.motivationIsGeneric = true;
  if (draft.onboardingGoalLocked === true) snap.onboardingGoalLocked = true;
  return snap;
}

/** Local draft after the user deletes Future You from the app (plan / subscription unchanged). */
export function futureYouDraftAfterUserDelete(current: FutureYouDraft | undefined): FutureYouDraft {
  const next: FutureYouDraft = {};
  if (current?.onboardingGoalLocked === true) next.onboardingGoalLocked = true;
  const readyAt = current?.generationReadyAt?.trim();
  if (readyAt) next.generationReadyAt = readyAt;
  return Object.keys(next).length > 0 ? next : EMPTY_FUTURE_YOU_DRAFT;
}

export { canRevisitFutureYouPhoto } from "@newyouai/core";
