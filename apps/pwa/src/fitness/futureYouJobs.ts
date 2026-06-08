/** Postgres `future_you_jobs.status` values (migration 005). */
export const FUTURE_YOU_JOB_STATUSES = [
  "queued",
  "generating",
  "ready",
  "failed",
] as const;

export type FutureYouJobStatus = (typeof FUTURE_YOU_JOB_STATUSES)[number];

/** In-flight statuses — at most one row per user (partial unique index). */
export const FUTURE_YOU_ACTIVE_STATUSES: readonly FutureYouJobStatus[] = [
  "queued",
  "generating",
];

export type FutureYouJobRow = {
  id: string;
  user_id: string;
  status: FutureYouJobStatus;
  motivation_id: string;
  source_photo_path: string | null;
  result_photo_path: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export function isFutureYouJobStatus(value: string): value is FutureYouJobStatus {
  return (FUTURE_YOU_JOB_STATUSES as readonly string[]).includes(value);
}

export function isFutureYouJobActive(status: FutureYouJobStatus): boolean {
  return status === "queued" || status === "generating";
}

export function isFutureYouJobTerminal(status: FutureYouJobStatus): boolean {
  return status === "ready" || status === "failed";
}

/** Valid server-side status transitions for generation lifecycle. */
export function canTransitionFutureYouJobStatus(
  from: FutureYouJobStatus,
  to: FutureYouJobStatus,
): boolean {
  if (from === to) return true;
  switch (from) {
    case "queued":
      return to === "generating" || to === "failed";
    case "generating":
      return to === "ready" || to === "failed";
    case "ready":
    case "failed":
      return false;
    default:
      return false;
  }
}
