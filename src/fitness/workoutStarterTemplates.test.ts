import { describe, expect, it } from "vitest";

import {
  WORKOUT_STARTER_TEMPLATES,
  buildRoutineTemplatesFromStarter,
  defaultWeekdaysForStarter,
  findWorkoutStarterTemplate,
  isMultiDayStarter,
  workoutStarterTemplatesByCategory,
} from "./workoutStarterTemplates";

describe("workoutStarterTemplates", () => {
  it("defines a broad catalog without duplicate ids", () => {
    const ids = WORKOUT_STARTER_TEMPLATES.map((t) => t.id);
    expect(ids.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("groups templates into categories", () => {
    const groups = workoutStarterTemplatesByCategory();
    expect(groups.some((g) => g.category === "splits")).toBe(true);
    expect(groups.some((g) => g.category === "programs")).toBe(true);
    expect(groups.reduce((n, g) => n + g.templates.length, 0)).toBe(WORKOUT_STARTER_TEMPLATES.length);
  });

  it("materializes exercises with sets and targets", () => {
    const push = findWorkoutStarterTemplate("push-day");
    expect(push).toBeDefined();
    const built = buildRoutineTemplatesFromStarter(push!);
    expect(built).toHaveLength(1);
    expect(built[0]!.exercises.length).toBeGreaterThanOrEqual(5);
    expect(built[0]!.exercises.every((e) => e.sets.length >= 3 && e.target.trim())).toBe(true);
  });

  it("assigns weekdays for multi-day programs", () => {
    const ppl = findWorkoutStarterTemplate("program-ppl");
    expect(ppl).toBeDefined();
    expect(isMultiDayStarter(ppl!)).toBe(true);
    const weekdays = defaultWeekdaysForStarter(ppl!);
    expect(weekdays).toEqual(["Mon", "Tue", "Thu"]);
    const built = buildRoutineTemplatesFromStarter(ppl!);
    expect(built.map((d) => d.dayLabel)).toEqual(["Mon", "Tue", "Thu"]);
    expect(built.map((d) => d.name)).toEqual(["Push", "Pull", "Legs"]);
  });
});
