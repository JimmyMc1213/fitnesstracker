/** Onboarding step indices used by routing (see future-you-onboarding-spec.md). */

export const ONBOARDING_STEP_PACE = 10;
/** Step 10b — Future You photo upload. */
export const ONBOARDING_STEP_FUTURE_YOU_PHOTO = 100;
/** Step 10c — motivation picker (step 12 in build checklist). */
export const ONBOARDING_STEP_FUTURE_YOU_MOTIVATION = 101;
export const ONBOARDING_STEP_ACTIVITY = 11;

export function isFutureYouOnboardingStep(step: number): boolean {
  return step === ONBOARDING_STEP_FUTURE_YOU_PHOTO || step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION;
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

/** Subscription paywall (checklist step 28). */
export const ONBOARDING_STEP_PAYWALL = 27;
/** Post-pay Future You success reveal (checklist step 28b). */
export const ONBOARDING_STEP_FUTURE_YOU_SUCCESS = 28;

export function clampOnboardingStepIndex(stepIndex: number): number {
  if (isFutureYouOnboardingStep(stepIndex)) return stepIndex;
  if (stepIndex === ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return ONBOARDING_STEP_FUTURE_YOU_SUCCESS;
  return Math.min(Math.max(0, Math.round(stepIndex)), ONBOARDING_STEP_PAYWALL);
}
