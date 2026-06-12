import type { FutureYouDraft } from "@newyouai/types";

/** Skipped photo at 10b — may return from step 11+ to upload; not if a job or upload exists. */
export function canRevisitFutureYouPhoto(futureYou: FutureYouDraft | undefined): boolean {
  if (futureYou?.photoSkipped !== true) return false;
  if (futureYou.photoStoragePath || futureYou.generationJobId) return false;
  return true;
}
