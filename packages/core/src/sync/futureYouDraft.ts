import type { FutureYouDraft, FutureYouJobStatus } from "@newyouai/types";

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

/** Local draft no longer references uploaded/generated media (e.g. after in-app delete). */
export function isFutureYouMediaCleared(draft: FutureYouDraft): boolean {
  return (
    !draft.photoStoragePath?.trim() &&
    !draft.generationJobId?.trim() &&
    !draft.resultStoragePath?.trim()
  );
}
