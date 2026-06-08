import type { FutureYouJobStatus } from "./futureYouJobs";

export type FutureYouDraft = {
  photoSkipped?: boolean;
  photoUploaded?: boolean;
  /** ISO timestamp when user accepted AI photo processing on step 10b. */
  photoAiConsentAt?: string;
  photoStoragePath?: string;
  motivationId?: string;
  motivationIsGeneric?: boolean;
  generationStatus?: FutureYouJobStatus | "idle";
  generationJobId?: string;
  /** ISO timestamp when the current preview job reached ready (for 2-week redo cadence). */
  generationReadyAt?: string;
  resultStoragePath?: string;
  onboardingGoalLocked?: boolean;
  /** User turned off Home NewYou reminder pill in Settings. */
  remindersMuted?: boolean;
  /** Local YYYY-MM-DD when the user dismissed the Home reminder pill for that day. */
  reminderDismissedDateKey?: string;
};

export const EMPTY_FUTURE_YOU_DRAFT: FutureYouDraft = {};

function isGenerationStatus(value: unknown): value is FutureYouJobStatus | "idle" {
  return (
    value === "idle" ||
    value === "queued" ||
    value === "generating" ||
    value === "ready" ||
    value === "failed"
  );
}

export function normalizeFutureYouDraft(raw: unknown): FutureYouDraft | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const draft: FutureYouDraft = {};

  if (o.photoSkipped === true) draft.photoSkipped = true;
  if (o.photoUploaded === true) draft.photoUploaded = true;
  if (typeof o.photoAiConsentAt === "string" && o.photoAiConsentAt.trim()) {
    draft.photoAiConsentAt = o.photoAiConsentAt.trim();
  }
  if (typeof o.photoStoragePath === "string" && o.photoStoragePath.trim()) {
    draft.photoStoragePath = o.photoStoragePath.trim();
  }
  if (typeof o.motivationId === "string" && o.motivationId.trim()) {
    draft.motivationId = o.motivationId.trim();
  }
  if (o.motivationIsGeneric === true) draft.motivationIsGeneric = true;
  if (isGenerationStatus(o.generationStatus)) draft.generationStatus = o.generationStatus;
  if (typeof o.generationJobId === "string" && o.generationJobId.trim()) {
    draft.generationJobId = o.generationJobId.trim();
  }
  if (typeof o.generationReadyAt === "string" && o.generationReadyAt.trim()) {
    draft.generationReadyAt = o.generationReadyAt.trim();
  }
  if (typeof o.resultStoragePath === "string" && o.resultStoragePath.trim()) {
    draft.resultStoragePath = o.resultStoragePath.trim();
  }
  if (o.onboardingGoalLocked === true) draft.onboardingGoalLocked = true;
  if (o.remindersMuted === true) draft.remindersMuted = true;
  if (typeof o.reminderDismissedDateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.reminderDismissedDateKey)) {
    draft.reminderDismissedDateKey = o.reminderDismissedDateKey;
  }

  return Object.keys(draft).length > 0 ? draft : undefined;
}

export function mergeFutureYouDraft(
  current: FutureYouDraft | undefined,
  patch: Partial<FutureYouDraft>,
): FutureYouDraft {
  return { ...EMPTY_FUTURE_YOU_DRAFT, ...current, ...patch };
}

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

/** Local draft no longer references uploaded/generated media (e.g. after in-app delete). */
export function isFutureYouMediaCleared(draft: FutureYouDraft): boolean {
  return (
    !draft.photoStoragePath?.trim() &&
    !draft.generationJobId?.trim() &&
    !draft.resultStoragePath?.trim()
  );
}

/** Local draft after the user deletes Future You from the app (plan / subscription unchanged). */
export function futureYouDraftAfterUserDelete(current: FutureYouDraft | undefined): FutureYouDraft {
  const next: FutureYouDraft = {};
  if (current?.onboardingGoalLocked === true) next.onboardingGoalLocked = true;
  const readyAt = current?.generationReadyAt?.trim();
  if (readyAt) next.generationReadyAt = readyAt;
  return Object.keys(next).length > 0 ? next : EMPTY_FUTURE_YOU_DRAFT;
}

/** Skipped photo at 10b — may return from step 11+ to upload; not if a job or upload exists. */
export function canRevisitFutureYouPhoto(futureYou: FutureYouDraft | undefined): boolean {
  if (futureYou?.photoSkipped !== true) return false;
  if (futureYou.photoStoragePath || futureYou.generationJobId) return false;
  return true;
}
