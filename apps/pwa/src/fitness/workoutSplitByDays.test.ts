import { describe, expect, it } from "vitest";

import { buildWorkoutTemplatesForDays } from "./workoutSplitByDays";

describe("buildWorkoutTemplatesForDays", () => {
  it("uses default split meta day labels when trainingWeekdays omitted", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym");
    expect(templates).toHaveLength(4);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Tue", "Wed", "Thu"]);
    expect(templates.every((t) => t.exercises.length > 0)).toBe(true);
    expect(templates.every((t) => t.estimatedMinutes != null)).toBe(true);
  });

  it("maps dayLabel from trainingWeekdays when provided", () => {
    const templates = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", [
      "Mon",
      "Tue",
      "Thu",
      "Fri",
    ]);
    expect(templates).toHaveLength(4);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Tue", "Thu", "Fri"]);
  });

  it("maps 3-day custom weekdays with PPL for intermediate", () => {
    const templates = buildWorkoutTemplatesForDays(3, "intermediate", "full_gym", ["Wed", "Fri", "Sun"]);
    expect(templates).toHaveLength(3);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Wed", "Fri", "Sun"]);
    expect(templates.map((t) => t.name)).toEqual(["Push", "Pull", "Legs"]);
  });

  it("uses full-body ABC for 3-day beginner", () => {
    const templates = buildWorkoutTemplatesForDays(3, "beginner", "home_gym", ["Mon", "Tue", "Thu"]);
    expect(templates.map((t) => t.name)).toEqual(["Full body A", "Full body B", "Full body C"]);
  });

  it("sizes exercise count by session length", () => {
    const short = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, "under_30");
    const long = buildWorkoutTemplatesForDays(4, "intermediate", "full_gym", undefined, "90_plus");
    expect(short[0]?.exercises.length).toBeLessThan(long[0]?.exercises.length ?? 0);
  });

  it("never assigns more than 4 sets per exercise", () => {
    const sessionLengths = ["under_30", "30_45", "45_60", "60_90", "90_plus"] as const;
    for (const length of sessionLengths) {
      for (const level of ["beginner", "intermediate", "advanced"] as const) {
        const templates = buildWorkoutTemplatesForDays(4, level, "full_gym", undefined, length);
        for (const template of templates) {
          for (const exercise of template.exercises) {
            expect(exercise.sets.length).toBeLessThanOrEqual(4);
          }
        }
      }
    }
  });
});
