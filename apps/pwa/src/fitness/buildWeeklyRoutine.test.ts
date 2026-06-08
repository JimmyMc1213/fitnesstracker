import { describe, expect, it } from "vitest";

import { buildBlankWeeklyRoutineTemplates, buildWeeklyRoutineTemplates, weeklyRoutineContentMatches } from "./buildWeeklyRoutine";

describe("buildWeeklyRoutine", () => {
  it("builds generated templates for selected weekdays", () => {
    const templates = buildWeeklyRoutineTemplates(
      { workoutDaysPerWeek: 3, trainingWeekdays: ["Mon", "Wed", "Fri"] },
      "intermediate",
      "full_gym",
      "45_60",
    );
    expect(templates).toHaveLength(3);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Mon", "Wed", "Fri"]);
    expect(templates.every((t) => t.exercises.length > 0)).toBe(true);
  });

  it("builds blank templates for manual weekly setup", () => {
    const templates = buildBlankWeeklyRoutineTemplates(["Tue", "Thu", "Sat"]);
    expect(templates).toHaveLength(3);
    expect(templates.map((t) => t.dayLabel)).toEqual(["Tue", "Thu", "Sat"]);
    expect(templates.every((t) => t.exercises.length === 0)).toBe(true);
  });

  it("detects when regenerated weekly routines match the current program", () => {
    const profile = { workoutDaysPerWeek: 3 as const, trainingWeekdays: ["Mon", "Wed", "Fri"] };
    const first = buildWeeklyRoutineTemplates(profile, "intermediate", "full_gym", "45_60");
    const second = buildWeeklyRoutineTemplates(profile, "intermediate", "full_gym", "45_60");
    expect(weeklyRoutineContentMatches(second, first)).toBe(true);
  });

  it("detects when regenerated weekly routines differ from the current program", () => {
    const weekdays = { workoutDaysPerWeek: 3 as const, trainingWeekdays: ["Mon", "Wed", "Fri"] };
    const current = buildWeeklyRoutineTemplates(weekdays, "intermediate", "full_gym", "45_60");
    const next = buildWeeklyRoutineTemplates(weekdays, "beginner", "full_gym", "45_60");
    expect(weeklyRoutineContentMatches(next, current)).toBe(false);
  });
});
