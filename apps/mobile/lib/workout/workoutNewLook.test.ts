import { describe, expect, it } from "vitest";

import {
  formatFlatExerciseTitle,
  isUpperStrengthMondayWorkout,
} from "@/lib/workout/workoutNewLook";
import type { WorkoutRoutineTemplate } from "@newyouai/types";

function template(overrides: Partial<WorkoutRoutineTemplate>): WorkoutRoutineTemplate {
  return {
    id: "tpl-1",
    name: "Upper strength",
    dayLabel: "Mon",
    focus: "",
    exercises: [],
    ...overrides,
  };
}

describe("isUpperStrengthMondayWorkout", () => {
  it("matches Upper strength on Mon", () => {
    const templates = [template({ id: "mon-upper" })];
    expect(isUpperStrengthMondayWorkout("mon-upper", templates)).toBe(true);
  });

  it("rejects Upper strength on other days", () => {
    const templates = [template({ id: "tue-upper", dayLabel: "Tue" })];
    expect(isUpperStrengthMondayWorkout("tue-upper", templates)).toBe(false);
  });

  it("rejects other workouts on Mon", () => {
    const templates = [template({ id: "mon-lower", name: "Lower strength" })];
    expect(isUpperStrengthMondayWorkout("mon-lower", templates)).toBe(false);
  });
});

describe("formatFlatExerciseTitle", () => {
  it("appends machine label in parentheses", () => {
    expect(formatFlatExerciseTitle("Seated Leg Press", "Machine")).toBe("Seated Leg Press (Machine)");
  });
});
