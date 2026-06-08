/** Keep in sync with src/fitness/futureYouJobs.ts */

export const FUTURE_YOU_JOB_STATUSES = [
  "queued",
  "generating",
  "ready",
  "failed",
] as const;

export type FutureYouJobStatus = (typeof FUTURE_YOU_JOB_STATUSES)[number];

export function isFutureYouJobStatus(value: string): value is FutureYouJobStatus {
  return (FUTURE_YOU_JOB_STATUSES as readonly string[]).includes(value);
}
