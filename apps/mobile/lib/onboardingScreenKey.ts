import {
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_RESIDENCY,
} from "@newyouai/core";

export type OnboardingScreenLayerFlags = {
  goalWeightReinforcement: boolean;
  scheduleReinforcement: boolean;
  templateReview: boolean;
};

export function onboardingScreenKey(
  step: number,
  flags: OnboardingScreenLayerFlags,
): string {
  if (step === 9 && flags.goalWeightReinforcement) return "9-reinforcement";
  if (step === 15 && flags.scheduleReinforcement) return "15-reinforcement";
  if (step === 23 && flags.templateReview) return "23-template-review";
  if (step === ONBOARDING_STEP_RESIDENCY) return "10a-residency";
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return "10b-photo";
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return "10c-motivation";
  return String(step);
}

export function parseOnboardingScreenKey(key: string): { step: number } & OnboardingScreenLayerFlags {
  if (key === "9-reinforcement") {
    return { step: 9, goalWeightReinforcement: true, scheduleReinforcement: false, templateReview: false };
  }
  if (key === "15-reinforcement") {
    return { step: 15, goalWeightReinforcement: false, scheduleReinforcement: true, templateReview: false };
  }
  if (key === "23-template-review") {
    return { step: 23, goalWeightReinforcement: false, scheduleReinforcement: false, templateReview: true };
  }
  if (key === "10a-residency") {
    return {
      step: ONBOARDING_STEP_RESIDENCY,
      goalWeightReinforcement: false,
      scheduleReinforcement: false,
      templateReview: false,
    };
  }
  if (key === "10b-photo") {
    return {
      step: ONBOARDING_STEP_FUTURE_YOU_PHOTO,
      goalWeightReinforcement: false,
      scheduleReinforcement: false,
      templateReview: false,
    };
  }
  if (key === "10c-motivation") {
    return {
      step: ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
      goalWeightReinforcement: false,
      scheduleReinforcement: false,
      templateReview: false,
    };
  }
  const step = Number(key);
  return { step, goalWeightReinforcement: false, scheduleReinforcement: false, templateReview: false };
}
