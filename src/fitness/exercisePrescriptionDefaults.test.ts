import { describe, expect, it } from "vitest";

import {
  CARRY_PRESCRIPTION_SUFFIX,
  defaultExerciseTarget,
  setFieldSecondColumnLabel,
  usesSecFieldForExercise,
} from "./exercisePrescriptionDefaults";
import { parseRepRangeBounds } from "./workoutTarget";

describe("exercisePrescriptionDefaults", () => {
  it("auto-generates timed targets in seconds", () => {
    expect(defaultExerciseTarget("Plank", undefined, 3)).toBe("3 × 30 sec");
    expect(defaultExerciseTarget("Side plank", undefined, 3)).toBe("3 × 20 sec");
    expect(defaultExerciseTarget("Wall sit", undefined, 3)).toBe("3 × 30 sec");
    expect(defaultExerciseTarget("L-sit hold", undefined, 3)).toBe("3 × 15 sec");
    expect(defaultExerciseTarget("Hollow body hold", undefined, 3)).toBe("3 × 20 sec");
    expect(defaultExerciseTarget("Battle rope waves", undefined, 3)).toBe("3 × 30 sec");
  });

  it("auto-generates carry targets with distance hint", () => {
    expect(defaultExerciseTarget("Farmers carry", undefined, 3)).toBe(`3 × ${CARRY_PRESCRIPTION_SUFFIX}`);
    expect(defaultExerciseTarget("Suitcase carry", undefined, 3)).toBe(`3 × ${CARRY_PRESCRIPTION_SUFFIX}`);
  });

  it("falls back to rep range for standard lifts", () => {
    expect(defaultExerciseTarget("Barbell bench press", "Barbell", 4, "8-12")).toBe("4 × 8-12");
  });

  it("flags timed exercises for Sec field labeling", () => {
    expect(usesSecFieldForExercise({ name: "Plank" })).toBe(true);
    expect(usesSecFieldForExercise({ name: "Farmers carry" })).toBe(true);
    expect(usesSecFieldForExercise({ name: "Barbell curl" })).toBe(false);
    expect(setFieldSecondColumnLabel({ name: "Side plank" })).toBe("Sec");
    expect(setFieldSecondColumnLabel({ name: "Dumbbell curl" })).toBe("Reps");
  });
});

describe("parseRepRangeBounds timed prescriptions", () => {
  it("parses seconds targets", () => {
    expect(parseRepRangeBounds("30 sec")).toEqual({ low: 30, high: 30 });
    expect(parseRepRangeBounds("30 sec (or 40m)")).toEqual({ low: 30, high: 30 });
  });
});
