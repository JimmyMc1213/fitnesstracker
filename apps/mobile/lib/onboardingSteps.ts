import type { FutureYouDraft } from "@newyouai/types";
import {
  canRevisitFutureYouPhoto,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_RESIDENCY,
  isFutureYouOnboardingStep,
  isOnboardingGoalEditStep,
  isOnboardingGoalLockStep,
} from "@newyouai/core";

export {
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  ONBOARDING_STEP_RESIDENCY,
  isFutureYouOnboardingStep,
  isOnboardingGoalEditStep,
  isOnboardingGoalLockStep,
};

/** Progress bar total after inserting 10b + 10c and removing save progress (paywall at 27). */
export const ONBOARDING_TOTAL_STEPS = 30;

/** Map internal step index to a 0-based progress position for the onboarding bar. */
export function onboardingProgressStep(step: number): number {
  if (step === ONBOARDING_STEP_RESIDENCY) return 10;
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return 11;
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return 12;
  if (step >= ONBOARDING_STEP_ACTIVITY) return step + 2;
  return step;
}

export function phaseForStep(step: number): { phaseLabel?: string } {
  if (step <= 1) return {};
  if (step <= 7) return { phaseLabel: "About you" };
  if (
    step <= ONBOARDING_STEP_ACTIVITY ||
    step === ONBOARDING_STEP_RESIDENCY ||
    step === ONBOARDING_STEP_FUTURE_YOU_PHOTO ||
    step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION
  ) {
    return { phaseLabel: "Your goal" };
  }
  if (step <= 21) return { phaseLabel: "Your training" };
  if (step <= 23) return { phaseLabel: "Your fuel" };
  if (step <= ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return { phaseLabel: "Launch" };
  return {};
}

/** Step 11 hides back unless the user skipped Future You and may return to upload. */
export function isOnboardingBackLocked(step: number, futureYou?: FutureYouDraft): boolean {
  if (step === ONBOARDING_STEP_ACTIVITY && canRevisitFutureYouPhoto(futureYou)) return false;
  return step === ONBOARDING_STEP_ACTIVITY;
}

/** Block re-entering the goal/Future You zone from post-lock steps (not within the zone itself). */
export function isOnboardingBackIntoGoalLockBlocked(
  fromStep: number,
  toStep: number,
  futureYou?: FutureYouDraft,
): boolean {
  if (isOnboardingGoalLockStep(fromStep)) return false;
  if (!isOnboardingGoalLockStep(toStep)) return false;
  if (canRevisitFutureYouPhoto(futureYou) && isFutureYouOnboardingStep(toStep)) return false;
  return true;
}
