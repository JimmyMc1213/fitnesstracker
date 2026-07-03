import {
  backStepFromFutureYouPhoto,
  canRevisitFutureYouPhoto,
  clampOnboardingStepIndex,
  isGoalWeightOrPaceStep,
  isMaintainGoal,
  isOnboardingGoalEditNavigationBlocked,
  isOnboardingIntoGoalLockNavigationBlocked,
  mergeFutureYouDraft,
  nextStepAfterGoal,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_PAYWALL,
} from "@newyouai/core";
import type { FutureYouDraft, NutritionGoal, OnboardingProfile } from "@newyouai/types";

import { ONBOARDING_WIZARD_START_STEP } from "@/lib/onboardingDefaults";
import {
  isOnboardingBackIntoGoalLockBlocked,
  isOnboardingBackLocked,
  ONBOARDING_TOTAL_STEPS,
} from "@/lib/onboardingSteps";

export type WizardNavOverrides = {
  futureYou?: FutureYouDraft;
};

export function resolveWizardNextStep(
  step: number,
  profile: OnboardingProfile,
  futureYou: FutureYouDraft | undefined,
): { next: number; overrides?: WizardNavOverrides } | null {
  if (isGoalWeightOrPaceStep(step) && isMaintainGoal(profile.goal)) {
    const goalLocked = mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true });
    return { next: ONBOARDING_STEP_FUTURE_YOU_PHOTO, overrides: { futureYou: goalLocked } };
  }

  if (step === 8) {
    const overrides: WizardNavOverrides = {};
    if (isMaintainGoal(profile.goal)) {
      overrides.futureYou = mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true });
    }
    return { next: nextStepAfterGoal(profile.goal), overrides };
  }

  if (step === ONBOARDING_STEP_PACE) {
    if (!profile.pace) return null;
    return {
      next: ONBOARDING_STEP_FUTURE_YOU_PHOTO,
      overrides: { futureYou: mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true }) },
    };
  }

  if (step === 9) {
    if (isMaintainGoal(profile.goal)) {
      return {
        next: ONBOARDING_STEP_FUTURE_YOU_PHOTO,
        overrides: { futureYou: mergeFutureYouDraft(futureYou, { onboardingGoalLocked: true }) },
      };
    }
    return { next: ONBOARDING_STEP_PACE };
  }

  // Steps 10b/10c use custom handlers (upload confirm + generation start).
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return null;
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return null;

  if (step === 16) return { next: 17 };

  if (step === 21) return { next: 22 };
  if (step === 22) return { next: 23 };
  if (step === 23) return { next: 24 };
  if (step === 24) return { next: 25 };
  if (step === 25) return { next: 26 };
  if (step === 26) return { next: ONBOARDING_STEP_PAYWALL };

  const next = Math.min(step + 1, ONBOARDING_STEP_FUTURE_YOU_SUCCESS);
  return { next };
}

export function resolveWizardBackStep(
  step: number,
  profile: OnboardingProfile,
  futureYou: FutureYouDraft | undefined,
): number | null {
  if (isOnboardingBackLocked(step, futureYou)) return null;

  if (step === ONBOARDING_STEP_ACTIVITY && canRevisitFutureYouPhoto(futureYou)) {
    return ONBOARDING_STEP_FUTURE_YOU_PHOTO;
  }

  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) {
    return ONBOARDING_STEP_FUTURE_YOU_PHOTO;
  }

  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) {
    if (canRevisitFutureYouPhoto(futureYou)) return ONBOARDING_STEP_ACTIVITY;
    return backStepFromFutureYouPhoto(profile.goal);
  }

  if (step === 18) return 17;
  if (step === 17) return 15;
  if (step === 21) return 19;
  if (step === 23) return 22;
  if (step === 22) return 21;
  if (step === ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return ONBOARDING_STEP_PAYWALL;
  if (step === ONBOARDING_STEP_PAYWALL) return 26;

  if (step <= ONBOARDING_WIZARD_START_STEP) return null;

  const prev = step - 1;
  if (isOnboardingBackIntoGoalLockBlocked(step, prev, futureYou)) return null;
  return Math.max(prev, ONBOARDING_WIZARD_START_STEP);
}

export function canNavigateWizardToStep(
  fromStep: number,
  toStep: number,
  futureYou: FutureYouDraft | undefined,
): boolean {
  if (isOnboardingGoalEditNavigationBlocked(fromStep, toStep)) return false;
  if (isOnboardingIntoGoalLockNavigationBlocked(fromStep, toStep, futureYou)) return false;
  return true;
}

export function clampWizardStep(step: number): number {
  return clampOnboardingStepIndex(step);
}

export const WIZARD_MAX_STEP = ONBOARDING_STEP_FUTURE_YOU_SUCCESS;
export { ONBOARDING_TOTAL_STEPS };

export function stepTitleForPlaceholder(step: number, goal?: NutritionGoal): string {
  if (step === 0) return "Welcome";
  if (step === 1) return "Theme";
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return "Future You photo";
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return "Future You motivation";
  if (step === ONBOARDING_STEP_PAYWALL) return "Paywall";
  if (step === ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return "Future You success";
  if (step === 8 && goal) return `Primary goal (${goal})`;
  return `Step ${step}`;
}
