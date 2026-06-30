import { FUTURE_YOU_GENERATION_REFUSED_ERROR } from "./generationPillModel";
import { FUTURE_YOU_JOB_STALE_ERROR } from "./staleJob";

export const FUTURE_YOU_FAILURE_TIPS_INTRO = "Sometimes a photo doesn't work. For best results:";

export const FUTURE_YOU_FAILURE_TIPS = [
  "Use a clear, well-lit, full-body photo",
  "Face the camera straight on, standing",
  "Avoid blur, heavy shadows, or busy backgrounds",
  "Make sure your whole body is in frame, head to knees",
] as const;

export const FUTURE_YOU_FAILURE_PRIMARY_CTA = "Upload a different photo";

export const FUTURE_YOU_FAILURE_SYSTEM_LEAD = "Something went wrong on our end — try again.";

/** Errors that indicate a transient/system failure rather than a photo/content issue. */
const TRANSIENT_ERROR_CODES = new Set(["not_found"]);

function isTransientFutureYouError(error: string | undefined): boolean {
  const trimmed = error?.trim();
  if (!trimmed) return false;
  if (TRANSIENT_ERROR_CODES.has(trimmed)) return true;
  if (trimmed === FUTURE_YOU_JOB_STALE_ERROR) return true;
  if (/timed out|timeout|network|server error|internal error|try again later/i.test(trimmed)) {
    return true;
  }
  return false;
}

export type FutureYouFailureCopy = {
  lead: string;
  showTips: boolean;
};

/** Map a stored job error to gender-neutral recovery copy. */
export function futureYouFailureCopy(error?: string): FutureYouFailureCopy {
  const trimmed = error?.trim();
  if (isTransientFutureYouError(trimmed)) {
    return { lead: FUTURE_YOU_FAILURE_SYSTEM_LEAD, showTips: false };
  }
  if (trimmed === FUTURE_YOU_GENERATION_REFUSED_ERROR) {
    return { lead: FUTURE_YOU_FAILURE_TIPS_INTRO, showTips: true };
  }
  return { lead: FUTURE_YOU_FAILURE_TIPS_INTRO, showTips: true };
}
