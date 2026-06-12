import type { WorkoutRoutineTemplate } from "@newyouai/types";
import { describe, expect, it } from "vitest";

import { buildWeeklyRoutineTemplates } from "@/lib/workout/buildWeeklyRoutine";

describe("OnboardingSplitReveal weekday labels", () => {
  it("matches trainingWeekdays from templates built on step 15", () => {
    const profile = {
      workoutDaysPerWeek: 4 as const,
      trainingWeekdays: ["Mon", "Tue", "Thu", "Fri"],
    };
    const templates = buildWeeklyRoutineTemplates(
      profile,
      "intermediate",
      "full_gym",
      "45_60",
    );

    expect(templates).toHaveLength(4);
    expect(templates.map((t) => t.dayLabel)).toEqual(profile.trainingWeekdays);
  });

  it("preserves day labels on draft snapshot", () => {
    const templates: WorkoutRoutineTemplate[] = [
      {
        id: "mon-push",
        name: "Push",
        dayLabel: "Mon",
        focus: "Chest · shoulders",
        exercises: [{ id: "e1", name: "Bench Press", target: "3×8", sets: [] }],
      },
    ];
    const snapshot = templates.map((t) => ({ ...t, exercises: [...t.exercises] }));
    expect(snapshot[0]?.dayLabel).toBe("Mon");
  });
});
