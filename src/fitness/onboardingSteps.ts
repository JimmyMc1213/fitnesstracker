/** Internal onboarding step indices (see future-you-onboarding-spec.md). */

import type { FutureYouDraft } from "./futureYouDraft";
import { canRevisitFutureYouPhoto } from "./futureYouDraft";

export const ONBOARDING_STEP_PACE = 10;
/** Step 10b — Future You photo upload. */
export const ONBOARDING_STEP_FUTURE_YOU_PHOTO = 100;
/** Step 10c — motivation picker (step 12 in build checklist). */
export const ONBOARDING_STEP_FUTURE_YOU_MOTIVATION = 101;
export const ONBOARDING_STEP_ACTIVITY = 11;
/** Subscription paywall (checklist step 28). */
export const ONBOARDING_STEP_PAYWALL = 27;
/** Post-pay Future You success reveal (checklist step 28b). */
export const ONBOARDING_STEP_FUTURE_YOU_SUCCESS = 28;

/** Progress bar total after inserting 10b + 10c and removing save progress (paywall at 27). */
export const ONBOARDING_TOTAL_STEPS = 30;

export function isFutureYouOnboardingStep(step: number): boolean {
  return step === ONBOARDING_STEP_FUTURE_YOU_PHOTO || step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION;
}

/** Map internal step index to a 0-based progress position for the onboarding bar. */
export function onboardingProgressStep(step: number): number {
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return 11;
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return 12;
  if (step >= ONBOARDING_STEP_ACTIVITY) return step + 2;
  return step;
}

export function clampOnboardingStepIndex(stepIndex: number): number {
  if (isFutureYouOnboardingStep(stepIndex)) return stepIndex;
  if (stepIndex === ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return ONBOARDING_STEP_FUTURE_YOU_SUCCESS;
  return Math.min(Math.max(0, Math.round(stepIndex)), ONBOARDING_STEP_PAYWALL);
}

/** Steps where goal, goal weight, or pace can still be edited. */
export function isOnboardingGoalEditStep(step: number): boolean {
  return step === 8 || step === 9 || step === ONBOARDING_STEP_PACE;
}

/** Goal + Future You inputs that feed the AI job — locked once the user reaches step 11. */
export function isOnboardingGoalLockStep(step: number): boolean {
  return (
    step === 8 ||
    step === 9 ||
    step === ONBOARDING_STEP_PACE ||
    step === ONBOARDING_STEP_FUTURE_YOU_PHOTO ||
    step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION
  );
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
