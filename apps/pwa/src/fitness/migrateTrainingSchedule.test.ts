import { describe, expect, it } from "vitest";

import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
import { DEFAULT_ONBOARDING_PROFILE } from "./onboardingProfile";
import { migrateTrainingSchedule } from "./migrateTrainingSchedule";

describe("migrateTrainingSchedule", () => {
  it("backfills trainingWeekdays from template dayLabels", () => {
    const templates = buildWorkoutTemplatesForDays(3, "intermediate", "full_gym");
    const { profile, dirty } = migrateTrainingSchedule(
      { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 3, trainingWeekdays: undefined },
      templates,
    );
    expect(dirty).toBe(true);
    expect(profile.trainingWeekdays).toEqual(["Mon", "Tue", "Thu"]);
  });

  it("is idempotent when weekdays and labels already match", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym");
    const first = migrateTrainingSchedule(
      { ...DEFAULT_ONBOARDING_PROFILE, workoutDaysPerWeek: 4, trainingWeekdays: undefined },
      templates,
    );
    const second = migrateTrainingSchedule(first.profile, first.templates);
    expect(second.dirty).toBe(false);
  });
});
