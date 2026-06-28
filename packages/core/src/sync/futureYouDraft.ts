import type { FutureYouDraft, FutureYouJobStatus, FutureYouPreview } from "@newyouai/types";

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

function normalizeFutureYouPreview(raw: unknown): FutureYouPreview | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const jobId = typeof o.jobId === "string" ? o.jobId.trim() : "";
  if (!jobId) return undefined;
  const preview: FutureYouPreview = { jobId };
  if (typeof o.motivationId === "string" && o.motivationId.trim()) {
    preview.motivationId = o.motivationId.trim();
  }
  if (o.motivationIsGeneric === true) preview.motivationIsGeneric = true;
  if (typeof o.readyAt === "string" && o.readyAt.trim()) preview.readyAt = o.readyAt.trim();
  if (typeof o.timeline === "string" && o.timeline.trim()) preview.timeline = o.timeline.trim();
  if (typeof o.sourcePhotoPath === "string" && o.sourcePhotoPath.trim()) {
    preview.sourcePhotoPath = o.sourcePhotoPath.trim();
  }
  return preview;
}

function normalizeFutureYouPreviews(raw: unknown): FutureYouPreview[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set<string>();
  const previews: FutureYouPreview[] = [];
  for (const entry of raw) {
    const preview = normalizeFutureYouPreview(entry);
    if (!preview || seen.has(preview.jobId)) continue;
    seen.add(preview.jobId);
    previews.push(preview);
  }
  return previews.length > 0 ? previews : undefined;
}

/** Merge preview lists from any number of drafts, de-duplicated by jobId (first wins). */
export function unionFutureYouPreviews(
  ...lists: (FutureYouPreview[] | undefined)[]
): FutureYouPreview[] | undefined {
  const seen = new Set<string>();
  const merged: FutureYouPreview[] = [];
  for (const list of lists) {
    if (!list) continue;
    for (const preview of list) {
      const jobId = preview.jobId?.trim();
      if (!jobId || seen.has(jobId)) continue;
      seen.add(jobId);
      merged.push(preview);
    }
  }
  return merged.length > 0 ? merged : undefined;
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
  const previews = normalizeFutureYouPreviews(o.previews);
  if (previews) draft.previews = previews;
  if (o.onboardingGoalLocked === true) draft.onboardingGoalLocked = true;
  if (o.remindersMuted === true) draft.remindersMuted = true;
  if (typeof o.reportedJobId === "string" && o.reportedJobId.trim()) {
    draft.reportedJobId = o.reportedJobId.trim();
  }
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
    !draft.resultStoragePath?.trim() &&
    !(draft.previews && draft.previews.length > 0)
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

/**
 * Local draft after deleting a single kept preview by jobId. Deleting an older preview just
 * drops it from the list; deleting the active job promotes the newest remaining preview to
 * active (or clears media, preserving the redo cooldown, when none remain).
 */
export function futureYouDraftAfterPreviewDelete(
  current: FutureYouDraft | undefined,
  jobId: string,
): FutureYouDraft {
  const draft = current ?? {};
  const target = jobId.trim();
  if (!target) return mergeFutureYouDraft(undefined, draft);

  const remaining = (draft.previews ?? []).filter((preview) => preview.jobId !== target);

  if (draft.generationJobId?.trim() !== target) {
    const next = mergeFutureYouDraft(undefined, draft);
    if (remaining.length > 0) next.previews = remaining;
    else delete next.previews;
    return next;
  }

  const carryReminderPrefs = (next: FutureYouDraft): void => {
    if (draft.onboardingGoalLocked === true) next.onboardingGoalLocked = true;
    if (draft.remindersMuted === true) next.remindersMuted = true;
    if (draft.reminderDismissedDateKey) next.reminderDismissedDateKey = draft.reminderDismissedDateKey;
  };

  const [promoted, ...rest] = remaining;
  if (!promoted) {
    const next: FutureYouDraft = {};
    carryReminderPrefs(next);
    const readyAt = draft.generationReadyAt?.trim();
    if (readyAt) next.generationReadyAt = readyAt;
    return Object.keys(next).length > 0 ? next : EMPTY_FUTURE_YOU_DRAFT;
  }

  const next: FutureYouDraft = {
    generationJobId: promoted.jobId,
    generationStatus: "ready",
    photoSkipped: false,
  };
  if (promoted.readyAt) next.generationReadyAt = promoted.readyAt;
  if (promoted.motivationId) next.motivationId = promoted.motivationId;
  if (promoted.motivationIsGeneric === true) next.motivationIsGeneric = true;
  if (draft.photoAiConsentAt) next.photoAiConsentAt = draft.photoAiConsentAt;
  carryReminderPrefs(next);
  if (rest.length > 0) next.previews = rest;
  return next;
}
