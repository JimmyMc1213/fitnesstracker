/** Keep in sync with packages/core/src/future-you/staleJob.ts */

import type { FutureYouJobStatus } from "./jobStatus.ts";

/**
 * Jobs in queued/generating longer than this are treated as stuck.
 * Must stay safely above this function's generation timeout (130s) and
 * Supabase's ~150s hard request limit so a slow-but-valid generation is never
 * marked failed by the status reconcile while the server is still working.
 */
export const FUTURE_YOU_JOB_STALE_MS = 5 * 60 * 1000;

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
