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
  /** Storage path of the source selfie used for this preview (kept until deleted). */
  sourcePhotoPath?: string;
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
  /** Stored job error string from the last failed generation (for recovery UI lead line). */
  generationError?: string;
  /** True after the client auto-retried once following a failed job. */
  generationAutoRetried?: boolean;
  /** True while a failed job is being automatically re-queued (pill retry copy). */
  generationRetrying?: boolean;
  /** ISO timestamp when the current preview job reached ready (for 2-week redo cadence). */
  generationReadyAt?: string;
  resultStoragePath?: string;
  /** Older completed previews the user kept (the active job stays in the fields above). */
  previews?: FutureYouPreview[];
  onboardingGoalLocked?: boolean;
  /** User turned off Home NewYou reminder pill in Settings. */
  remindersMuted?: boolean;
  /** Job id whose result the user reported — bypasses redo cooldown while it remains active. */
  reportedJobId?: string;
  /** Local YYYY-MM-DD when the user dismissed the Home reminder pill for that day. */
  reminderDismissedDateKey?: string;
};
