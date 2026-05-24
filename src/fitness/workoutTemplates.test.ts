import { describe, expect, it } from "vitest";

import {
  defaultWorkoutRoutineTemplates,
  isDefaultSeedWorkoutTemplates,
  sanitizeWorkoutTemplates,
} from "./data";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
import { buildAppStateFromPersisted } from "./buildAppState";
import { sliceFromAppState } from "./persistFitnessSlice";

describe("sanitizeWorkoutTemplates", () => {
  it("drops demo seed routines when onboarding templates exist for the same weekdays", () => {
    const defaults = defaultWorkoutRoutineTemplates();
    const onboarding = buildWorkoutTemplatesForDays(3, "intermediate", "full_gym");
    const stacked = [...defaults, ...onboarding];

    const sanitized = sanitizeWorkoutTemplates(stacked, { onboardingComplete: true });
    expect(sanitized).toHaveLength(3);
    expect(sanitized.every((t) => !isDefaultSeedWorkoutTemplates([t]))).toBe(true);
    expect(isDefaultSeedWorkoutTemplates(defaults)).toBe(true);
  });

  it("hides demo-only seed routines before onboarding completes", () => {
    const defaults = defaultWorkoutRoutineTemplates();
    expect(sanitizeWorkoutTemplates(defaults, { onboardingComplete: false })).toEqual([]);
  });

  it("keeps demo seed routines for legacy users after onboarding completes", () => {
    const defaults = defaultWorkoutRoutineTemplates();
    expect(sanitizeWorkoutTemplates(defaults, { onboardingComplete: true })).toHaveLength(5);
  });
});

describe("mergePersistedFitnessSlices workoutTemplates", () => {
  it("does not union demo seed routines with onboarding routines", () => {
    const defaults = defaultWorkoutRoutineTemplates();
    const onboarding = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym");
    const local = {
      ...sliceFromAppState(buildAppStateFromPersisted({ onboardingComplete: true })),
      workoutTemplates: onboarding,
    };
    const remote = {
      ...sliceFromAppState(buildAppStateFromPersisted({ onboardingComplete: true })),
      workoutTemplates: defaults,
    };

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.workoutTemplates).toHaveLength(4);
    expect(merged.workoutTemplates.every((t) => !defaults.some((d) => d.id === t.id))).toBe(true);
  });
});
