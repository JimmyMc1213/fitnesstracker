import { describe, expect, it } from "vitest";

import {
  isLegacyDemoWorkoutTemplates,
  LEGACY_DEMO_WORKOUT_IDS,
  sanitizeWorkoutTemplates,
} from "./data";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";
import { buildAppStateFromPersisted } from "./buildAppState";
import { sliceFromAppState } from "./persistFitnessSlice";
import type { WorkoutRoutineTemplate } from "./types";

function legacyDemoTemplateStubs(): WorkoutRoutineTemplate[] {
  return [...LEGACY_DEMO_WORKOUT_IDS].map((id, index) => ({
    id,
    name: `Legacy ${index}`,
    dayLabel: ["Mon", "Tue", "Wed", "Thu", "Fri"][index] ?? "Mon",
    focus: "",
    exercises: [],
  }));
}

describe("sanitizeWorkoutTemplates", () => {
  it("drops legacy demo routines when onboarding templates exist for the same weekdays", () => {
    const legacy = legacyDemoTemplateStubs();
    const onboarding = buildWorkoutTemplatesForDays(3, "intermediate", "full_gym");
    const stacked = [...legacy, ...onboarding];

    const sanitized = sanitizeWorkoutTemplates(stacked, { onboardingComplete: true });
    expect(sanitized).toHaveLength(3);
    expect(sanitized.every((t) => !LEGACY_DEMO_WORKOUT_IDS.has(t.id))).toBe(true);
    expect(isLegacyDemoWorkoutTemplates(legacy)).toBe(true);
  });

  it("hides legacy-only routines before onboarding completes", () => {
    const legacy = legacyDemoTemplateStubs();
    expect(sanitizeWorkoutTemplates(legacy, { onboardingComplete: false })).toEqual([]);
  });

  it("keeps legacy demo routines for completed users who still have them persisted", () => {
    const legacy = legacyDemoTemplateStubs();
    expect(sanitizeWorkoutTemplates(legacy, { onboardingComplete: true })).toHaveLength(5);
  });
});

describe("mergePersistedFitnessSlices workoutTemplates", () => {
  it("does not union legacy demo routines with onboarding routines", () => {
    const legacy = legacyDemoTemplateStubs();
    const onboarding = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym");
    const local = {
      ...sliceFromAppState(buildAppStateFromPersisted({ onboardingComplete: true })),
      workoutTemplates: onboarding,
    };
    const remote = {
      ...sliceFromAppState(buildAppStateFromPersisted({ onboardingComplete: true })),
      workoutTemplates: legacy,
    };

    const merged = mergePersistedFitnessSlices(local, remote);
    expect(merged.workoutTemplates).toHaveLength(4);
    expect(merged.workoutTemplates.every((t) => !legacy.some((d) => d.id === t.id))).toBe(true);
  });
});
