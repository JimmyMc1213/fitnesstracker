import { describe, expect, it } from "vitest";

import {
  appendKeypadDigit,
  applyKeypadIncrement,
  backspaceKeypadDraft,
  nextWorkoutKeypadTarget,
} from "./workoutKeypadLogic";
import type { WorkoutExercise } from "../types";

const exercises: WorkoutExercise[] = [
  {
    id: "e1",
    name: "Bench",
    target: "3 × 10",
    sets: [{ w: 0, r: 0, done: false }, { w: 0, r: 0, done: false }],
  },
  {
    id: "e2",
    name: "Row",
    target: "3 × 10",
    sets: [{ w: 0, r: 0, done: false }],
  },
];

describe("workoutKeypadLogic", () => {
  it("appends digits and blocks invalid reps decimals", () => {
    expect(appendKeypadDigit("", "1", false)).toBe("1");
    expect(appendKeypadDigit("12", ".", false)).toBe("12");
    expect(appendKeypadDigit("12", ".", true)).toBe("12.");
  });

  it("increments weight and reps in display units", () => {
    expect(applyKeypadIncrement("", "reps", 1, "lbs")).toBe("1");
    expect(applyKeypadIncrement("135", "weight", 5, "lbs")).toBe("140");
    expect(applyKeypadIncrement("60", "weight", 2.5, "kg")).toBe("62.5");
  });

  it("walks fields on next", () => {
    expect(nextWorkoutKeypadTarget(exercises, { exerciseId: "e1", setIndex: 0, field: "weight" })).toEqual({
      exerciseId: "e1",
      setIndex: 0,
      field: "reps",
    });
    expect(nextWorkoutKeypadTarget(exercises, { exerciseId: "e1", setIndex: 1, field: "reps" })).toEqual({
      exerciseId: "e2",
      setIndex: 0,
      field: "weight",
    });
  });

  it("backspaces draft values", () => {
    expect(backspaceKeypadDraft("135")).toBe("13");
  });
});
