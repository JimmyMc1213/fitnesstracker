import type { FutureYouDraft, FutureYouJobStatus, NutritionGoal, UserGender } from "@newyouai/types";

import {
  getFutureYouMotivationById,
  getFutureYouMotivationsForPicker,
} from "./futureYouMotivations";

export const FUTURE_YOU_GENERATION_PILL_READY_LABEL = "Your Future You is ready — unlock at the end";
export const FUTURE_YOU_GENERATION_PILL_CREATING_LABEL = "Creating your Future You…";
export const FUTURE_YOU_READY_BANNER_LABEL = "Your Future You is ready, keep going to unlock it.";

export const FUTURE_YOU_GENERATION_PILL_ROTATE_MS = 3500;

/** True when the onboarding generation pill should appear (photo path with an active job). */
/** Step 26 banner when generation finished before the user reaches the paywall. */
export function isFutureYouReadyBannerVisible(
  draft: FutureYouDraft | undefined,
  status: FutureYouJobStatus | "idle",
): boolean {
  if (!draft || draft.photoSkipped) return false;
  if (!draft.generationJobId?.trim()) return false;
  return status === "ready";
}

export function isFutureYouGenerationPillVisible(draft: FutureYouDraft | undefined): boolean {
  if (!draft || draft.photoSkipped) return false;
  if (!draft.generationJobId?.trim()) return false;
  const status = draft.generationStatus ?? "idle";
  return status !== "idle";
}

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
  ready: boolean;
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
    };
  }

  const subline = phrases[phraseIndex % phrases.length] ?? phrases[0];
  return {
    headline: FUTURE_YOU_GENERATION_PILL_CREATING_LABEL,
    subline,
    ready: false,
  };
}
