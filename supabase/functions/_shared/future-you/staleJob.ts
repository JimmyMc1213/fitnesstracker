/** Keep in sync with packages/core/src/future-you/staleJob.ts */

import type { FutureYouJobStatus } from "./jobStatus.ts";

/**
 * Jobs in queued/generating longer than this are treated as stuck.
 * Must stay safely above future-you-generate's background timeout (360s) so a
 * slow-but-valid generation is never marked failed while the server is working.
 */
export const FUTURE_YOU_JOB_STALE_MS = 7 * 60 * 1000;

export const FUTURE_YOU_JOB_STALE_ERROR = "Generation timed out. Try again.";

const ACTIVE_STATUSES: FutureYouJobStatus[] = ["queued", "generating"];

export function isFutureYouJobActiveStatus(status: string): status is FutureYouJobStatus {
  return (ACTIVE_STATUSES as string[]).includes(status);
}

export function isFutureYouJobStale(
  updatedAtIso: string | null | undefined,
  status: string,
  nowMs = Date.now(),
): boolean {
  if (!isFutureYouJobActiveStatus(status)) return false;
  const parsed = Date.parse(updatedAtIso ?? "");
  if (!Number.isFinite(parsed)) return true;
  return nowMs - parsed >= FUTURE_YOU_JOB_STALE_MS;
}
