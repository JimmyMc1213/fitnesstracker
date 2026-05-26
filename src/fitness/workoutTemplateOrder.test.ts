import { describe, expect, it } from "vitest";

import { applyOrderToTemplate, detectExerciseOrderChange, exerciseOrderKeys } from "./workoutTemplateOrder";
import type { WorkoutExercise, WorkoutRoutineTemplate } from "./types";

function exercise(name: string, label?: string): WorkoutExercise {
  return {
    id: `id-${name}`,
    name,
    label,
    target: "3 × 10",
    sets: [{ w: 0, r: 0, done: false }],
  };
}

const template: WorkoutRoutineTemplate = {
  id: "tpl-1",
  name: "Upper strength",
  dayLabel: "Mon",
  focus: "Bench",
  exercises: [exercise("Bench Press"), exercise("Row"), exercise("Curl")],
};

describe("exerciseOrderKeys", () => {
  it("maps exercises to stable note keys", () => {
    expect(exerciseOrderKeys(template.exercises)).toEqual(["bench press", "row", "curl"]);
  });
});

describe("detectExerciseOrderChange", () => {
  const baseline = ["bench press", "row", "curl"];

  it("returns false when order is unchanged", () => {
    expect(detectExerciseOrderChange(baseline, [...baseline])).toBe(false);
  });

  it("returns true when exercises are reordered", () => {
    expect(detectExerciseOrderChange(baseline, ["row", "bench press", "curl"])).toBe(true);
  });

  it("returns false when an exercise was added or removed", () => {
    expect(detectExerciseOrderChange(baseline, ["bench press", "row"])).toBe(false);
    expect(detectExerciseOrderChange(baseline, ["bench press", "row", "curl", "press"])).toBe(false);
  });

  it("returns false when an exercise was swapped", () => {
    expect(detectExerciseOrderChange(baseline, ["bench press", "row", "press"])).toBe(false);
  });

  it("returns false without a baseline", () => {
    expect(detectExerciseOrderChange(undefined, baseline)).toBe(false);
  });
});

describe("applyOrderToTemplate", () => {
  it("reorders template exercises to match session order keys", () => {
    const updated = applyOrderToTemplate(template, ["curl", "bench press", "row"]);
    expect(updated.exercises.map((e) => e.name)).toEqual(["Curl", "Bench Press", "Row"]);
    expect(updated.exercises.map((e) => e.id)).toEqual(["id-Curl", "id-Bench Press", "id-Row"]);
  });

  it("leaves template unchanged when keys do not match", () => {
    const updated = applyOrderToTemplate(template, ["bench press", "row"]);
    expect(updated).toBe(template);
  });
});
