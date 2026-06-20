import {
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
} from "@newyouai/core";

export type OnboardingScreenLayerFlags = {
  goalWeightReinforcement: boolean;
  scheduleReinforcement: boolean;
};

export function onboardingScreenKey(
  step: number,
  flags: OnboardingScreenLayerFlags,
): string {
  if (step === 9 && flags.goalWeightReinforcement) return "9-reinforcement";
  if (step === 15 && flags.scheduleReinforcement) return "15-reinforcement";
  if (step === ONBOARDING_STEP_FUTURE_YOU_PHOTO) return "10b-photo";
  if (step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION) return "10c-motivation";
  return String(step);
}

export function parseOnboardingScreenKey(key: string): { step: number } & OnboardingScreenLayerFlags {
  if (key === "9-reinforcement") {
    return { step: 9, goalWeightReinforcement: true, scheduleReinforcement: false };
  }
  if (key === "15-reinforcement") {
    return { step: 15, goalWeightReinforcement: false, scheduleReinforcement: true };
  }
  if (key === "10b-photo") {
    return {
      step: ONBOARDING_STEP_FUTURE_YOU_PHOTO,
      goalWeightReinforcement: false,
      scheduleReinforcement: false,
    };
  }
  if (key === "10c-motivation") {
    return {
      step: ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
      goalWeightReinforcement: false,
      scheduleReinforcement: false,
    };
  }
  const step = Number(key);
  return { step, goalWeightReinforcement: false, scheduleReinforcement: false };
}
