import {
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_PACE,
} from "@newyouai/core";
import { describe, expect, it } from "vitest";

import {
  canNavigateWizardToStep,
  resolveWizardBackStep,
  resolveWizardNextStep,
} from "./onboardingWizardNavigation";

const baseProfile = {
  heightIn: 70,
  weightLbs: 180,
  age: 30,
};

describe("resolveWizardNextStep", () => {
  it("skips goal weight and pace for maintain from step 8", () => {
    const result = resolveWizardNextStep(8, { ...baseProfile, goal: "maintain" }, undefined);
    expect(result?.next).toBe(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
    expect(result?.overrides?.futureYou?.onboardingGoalLocked).toBe(true);
  });

  it("advances cut users through pace and locks goal before Future You", () => {
    const pace = resolveWizardNextStep(
      ONBOARDING_STEP_PACE,
      { ...baseProfile, goal: "cut", goalWeightLbs: 165, pace: "balanced" },
      undefined,
    );
    expect(pace?.next).toBe(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
    expect(pace?.overrides?.futureYou?.onboardingGoalLocked).toBe(true);
  });

  it("skips optional template review from split reveal", () => {
    const result = resolveWizardNextStep(16, { ...baseProfile, goal: "maintain" }, undefined);
    expect(result?.next).toBe(18);
  });

  it("blocks pace continue without a pace selection", () => {
    const result = resolveWizardNextStep(
      ONBOARDING_STEP_PACE,
      { ...baseProfile, goal: "cut", goalWeightLbs: 165 },
      undefined,
    );
    expect(result).toBeNull();
  });
});

describe("resolveWizardBackStep", () => {
  it("blocks back into goal-lock zone from activity", () => {
    const prev = resolveWizardBackStep(ONBOARDING_STEP_ACTIVITY, { ...baseProfile, goal: "cut" }, {
      onboardingGoalLocked: true,
    });
    expect(prev).toBeNull();
  });

  it("returns pace when backing from Future You photo for cut users", () => {
    const prev = resolveWizardBackStep(
      ONBOARDING_STEP_FUTURE_YOU_PHOTO,
      { ...baseProfile, goal: "cut" },
      undefined,
    );
    expect(prev).toBe(ONBOARDING_STEP_PACE);
  });

  it("allows wizard back navigation from Future You photo to pace", () => {
    const prev = resolveWizardBackStep(
      ONBOARDING_STEP_FUTURE_YOU_PHOTO,
      { ...baseProfile, goal: "cut" },
      undefined,
    );
    expect(prev).toBe(ONBOARDING_STEP_PACE);
    expect(
      canNavigateWizardToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO, prev!, undefined),
    ).toBe(true);
  });

  it("skips optional template edit when backing from step 18", () => {
    expect(resolveWizardBackStep(18, { ...baseProfile, goal: "cut" }, undefined)).toBe(16);
  });

  it("returns to split reveal when backing from template review", () => {
    expect(resolveWizardBackStep(17, { ...baseProfile, goal: "cut" }, undefined)).toBe(16);
  });
});
