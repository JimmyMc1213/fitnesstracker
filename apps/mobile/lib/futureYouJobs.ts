import { FUTURE_YOU_JOB_STATUSES, type FutureYouJobStatus } from "@newyouai/types";

export { FUTURE_YOU_JOB_STATUSES, type FutureYouJobStatus };

export function isFutureYouJobActive(status: FutureYouJobStatus): boolean {
  return status === "queued" || status === "generating";
}
