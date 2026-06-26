/** Postgres `future_you_jobs.status` values (migration 005). */
export const FUTURE_YOU_JOB_STATUSES = [
  "queued",
  "generating",
  "ready",
  "failed",
] as const;

export type FutureYouJobStatus = (typeof FUTURE_YOU_JOB_STATUSES)[number];

/** A previously generated NewYou preview the user chose to keep (older than the active job). */
export type FutureYouPreview = {
  jobId: string;
  motivationId?: string;
  motivationIsGeneric?: boolean;
  /** ISO timestamp when this preview reached ready. */
  readyAt?: string;
  /** Timeline label captured at generation time (e.g. "3 months"). */
  timeline?: string;
};

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
  /** Older completed previews the user kept (the active job stays in the fields above). */
  previews?: FutureYouPreview[];
  onboardingGoalLocked?: boolean;
  /** User turned off Home NewYou reminder pill in Settings. */
  remindersMuted?: boolean;
  /** Local YYYY-MM-DD when the user dismissed the Home reminder pill for that day. */
  reminderDismissedDateKey?: string;
};
