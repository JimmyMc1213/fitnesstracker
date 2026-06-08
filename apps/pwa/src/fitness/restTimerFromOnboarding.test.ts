import { describe, expect, it } from "vitest";

import { buildAppStateFromPersisted } from "./buildAppState";
import { restSecondsFromTrainingDuration } from "./sessionLengthConfig";

describe("rest timer from onboarding session duration", () => {
  it("derives rest timer default from session duration when not persisted", () => {
    const state = buildAppStateFromPersisted({
      onboardingComplete: true,
      onboardingProfile: {
        goal: "maintain",
        heightIn: 70,
        weightLbs: 180,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        workoutDaysPerWeek: 4,
        sessionDuration: "60_to_90",
      },
    });

    expect(state.restTimerDefaultSeconds).toBe(restSecondsFromTrainingDuration("60_to_90"));
    expect(state.restTimerDefaultSeconds).toBe(90);
  });

  it("keeps persisted rest timer when user customized it", () => {
    const state = buildAppStateFromPersisted({
      onboardingComplete: true,
      restTimerDefaultSeconds: 120,
      onboardingProfile: {
        goal: "maintain",
        heightIn: 70,
        weightLbs: 180,
        age: 30,
        gender: "male",
        activityLevel: "moderate",
        workoutDaysPerWeek: 4,
        sessionDuration: "30_or_less",
      },
    });

    expect(state.restTimerDefaultSeconds).toBe(120);
  });
});
