import type { FutureYouDraft, NutritionGoal, UserGender } from "@newyouai/types";

import type { FutureYouJobStatus } from "./jobs";
import {
  getFutureYouMotivationById,
  getFutureYouMotivationsForPicker,
} from "./motivations";

export const FUTURE_YOU_GENERATION_PILL_READY_LABEL = "Your Future You is ready — unlock at the end";
export const FUTURE_YOU_GENERATION_PILL_CREATING_LABEL = "Creating your Future You…";
export const FUTURE_YOU_GENERATION_PILL_FAILED_LABEL = "We couldn't generate this one";
export const FUTURE_YOU_GENERATION_PILL_FAILED_SUBLINE = "Try a different photo from the NewYou tab";
export const FUTURE_YOU_READY_BANNER_LABEL = "Your Future You is ready, keep going to unlock it.";

export const FUTURE_YOU_GENERATION_PILL_ROTATE_MS = 3500;
export const FUTURE_YOU_GENERATION_POLL_INTERVAL_MS = 4000;

/**
 * Distinct job error stored by future-you-generate when the Responses
 * image_generation_call returns status="failed" with no error — a likely
 * content/safety refusal rather than a transient outage. Kept in sync with
 * supabase/functions/future-you-generate/providers/types.ts.
 */
export const FUTURE_YOU_GENERATION_REFUSED_ERROR = "generation_refused";

/** Reason-specific copy for a content/safety refusal (bad framing, lighting, etc.). */
export const FUTURE_YOU_GENERATION_REFUSED_MESSAGE =
  "This photo couldn't be used — try one with different framing or lighting.";

/** Generic terminal-failure copy when we don't have a more specific reason. */
export const FUTURE_YOU_GENERATION_FAILED_MESSAGE =
  "We couldn't generate this one — try a different photo.";

/** Map a stored job error string to user-facing copy for the failed state. */
export function futureYouGenerationErrorMessage(error: string | undefined): string {
  if (error?.trim() === FUTURE_YOU_GENERATION_REFUSED_ERROR) {
    return FUTURE_YOU_GENERATION_REFUSED_MESSAGE;
  }
  return FUTURE_YOU_GENERATION_FAILED_MESSAGE;
}

/** True when the onboarding generation pill should appear (photo path with an active job). */
export function isFutureYouGenerationPillVisible(draft: FutureYouDraft | undefined): boolean {
  if (!draft || draft.photoSkipped) return false;
  if (!draft.generationJobId?.trim()) return false;
  const status = draft.generationStatus ?? "idle";
  return status !== "idle";
}

export function shouldPollFutureYouGeneration(
  draft: FutureYouDraft | undefined,
  enabled: boolean,
): boolean {
  if (!draft) return false;
  if (!enabled || !isFutureYouGenerationPillVisible(draft)) return false;
  // "ready" and "failed" are both terminal — never poll a resolved job.
  return draft.generationStatus !== "ready" && draft.generationStatus !== "failed";
}

/** Step 26 banner when generation finished before the user reaches the paywall. */
export function isFutureYouReadyBannerVisible(
  draft: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
): boolean {
  if (!draft || draft.photoSkipped) return false;
  if (!draft.generationJobId?.trim()) return false;
  return status === "ready";
}

/** Rotating sub-lines for the pill — selected motivation first, then goal/gender pool. */
export function buildFutureYouGenerationPillPhrases(
  motivationId: string | undefined,
  goal: NutritionGoal,
  gender: UserGender,
): string[] {
  const phrases: string[] = [];
  const selected = motivationId ? getFutureYouMotivationById(motivationId) : undefined;
  if (selected?.loadingPhrase) {
    phrases.push(selected.loadingPhrase);
  }

  for (const motivation of getFutureYouMotivationsForPicker(goal, gender)) {
    if (motivation.loadingPhrase && !phrases.includes(motivation.loadingPhrase)) {
      phrases.push(motivation.loadingPhrase);
    }
  }

  return phrases.length > 0 ? phrases : [FUTURE_YOU_GENERATION_PILL_CREATING_LABEL];
}

export type FutureYouGenerationPillCopy = {
  headline: string;
  subline?: string;
  /** Generation finished successfully. */
  ready: boolean;
  /** Generation failed terminally — show an error, not a spinner. */
  failed: boolean;
};

export function futureYouGenerationPillCopy(
  status: FutureYouJobStatus | "idle",
  phraseIndex: number,
  phrases: string[],
): FutureYouGenerationPillCopy {
  if (status === "ready") {
    return {
      headline: FUTURE_YOU_GENERATION_PILL_READY_LABEL,
      ready: true,
      failed: false,
    };
  }

  if (status === "failed") {
    return {
      headline: FUTURE_YOU_GENERATION_PILL_FAILED_LABEL,
      subline: FUTURE_YOU_GENERATION_PILL_FAILED_SUBLINE,
      ready: false,
      failed: true,
    };
  }

  const subline = phrases[phraseIndex % phrases.length] ?? phrases[0];
  return {
    headline: FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
    subline,
    ready: false,
    failed: false,
  };
}
