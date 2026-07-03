import type { FutureYouDraft, NutritionGoal } from "@newyouai/types";

import { canRevisitFutureYouPhoto } from "./future-you-routing";
import {
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_RESIDENCY,
  isFutureYouOnboardingStep,
  isOnboardingGoalEditStep,
  isOnboardingGoalLockStep,
} from "./steps";

/** Maintain skips goal weight (9) and pace (10); cut/bulk go through both before Future You. */
export function isMaintainGoal(goal: NutritionGoal | undefined): boolean {
  return goal === "maintain";
}

export function isGoalWeightOrPaceStep(step: number): boolean {
  return step === 9 || step === ONBOARDING_STEP_PACE;
}

/** Forward from step 8 after the user picks a primary goal. */
export function nextStepAfterGoal(goal: NutritionGoal | undefined): number {
  return isMaintainGoal(goal) ? ONBOARDING_STEP_RESIDENCY : 9;
}

/** Back from step 10b — all goals return to residency (10a). */
export function backStepFromFutureYouPhoto(_goal: NutritionGoal | undefined): number {
  return ONBOARDING_STEP_RESIDENCY;
}

/**
 * Maintain users must never land on goal weight or pace screens (e.g. stale drafts).
 * Redirect to the Future You photo step instead.
 */
export function resolveMaintainOnboardingStep(step: number, goal: NutritionGoal | undefined): number {
  if (!isMaintainGoal(goal) || !isGoalWeightOrPaceStep(step)) return step;
  return ONBOARDING_STEP_RESIDENCY;
}

/** Back from residency — maintain returns to goal; cut/bulk return to pace. */
export function backStepFromResidency(goal: NutritionGoal | undefined): number {
  return isMaintainGoal(goal) ? 8 : ONBOARDING_STEP_PACE;
}

/** True once the user has reached activity (step 11) or later. */
export function isOnboardingPastGoalEditZone(step: number): boolean {
  return step >= ONBOARDING_STEP_ACTIVITY;
}

/**
 * Stale drafts may still point at goal/pace screens after the user committed past step 10.
 * Send them forward to activity instead of showing editable goal UI.
 */
export function resolveGoalLockedOnboardingStep(
  step: number,
  futureYou: FutureYouDraft | undefined,
): number {
  if (!isOnboardingGoalEditStep(step)) return step;
  if (futureYou?.onboardingGoalLocked !== true) return step;
  return ONBOARDING_STEP_ACTIVITY;
}

/** Apply maintain + goal-lock redirects when restoring an onboarding draft. */
export function resolveOnboardingStepOnRestore(
  step: number,
  goal: NutritionGoal | undefined,
  futureYou: FutureYouDraft | undefined,
): number {
  const afterMaintain = resolveMaintainOnboardingStep(step, goal);
  return resolveGoalLockedOnboardingStep(afterMaintain, futureYou);
}

/** Block navigation into goal-edit screens from step 11 onward. */
export function isOnboardingGoalEditNavigationBlocked(fromStep: number, toStep: number): boolean {
  // Future You steps (100/101) sit after pace but before activity — back is allowed.
  if (isFutureYouOnboardingStep(fromStep) && isOnboardingGoalEditStep(toStep)) return false;
  return isOnboardingPastGoalEditZone(fromStep) && isOnboardingGoalEditStep(toStep);
}

/** Block jumping into the locked zone from step 11+ (except skip → photo revisit). */
export function isOnboardingIntoGoalLockNavigationBlocked(
  fromStep: number,
  toStep: number,
  futureYou?: FutureYouDraft,
): boolean {
  if (!isOnboardingPastGoalEditZone(fromStep)) return false;
  if (isOnboardingGoalLockStep(fromStep)) return false;
  if (!isOnboardingGoalLockStep(toStep)) return false;
  if (canRevisitFutureYouPhoto(futureYou) && isFutureYouOnboardingStep(toStep)) return false;
  return true;
}
