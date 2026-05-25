import { describe, expect, it } from "vitest";

import type { WorkoutSet } from "./types";
import { normalizeWorkoutSetKind, setColumnLabel } from "./workoutSetKind";

describe("workoutSetKind", () => {
  it("normalizes unknown kinds to working", () => {
    expect(normalizeWorkoutSetKind("bogus")).toBe("working");
    expect(normalizeWorkoutSetKind("warmup")).toBe("warmup");
  });

  it("labels warm-up and working sets separately", () => {
    const sets: WorkoutSet[] = [
      { w: 0, r: 0, done: false, kind: "warmup" },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ];
    expect(setColumnLabel(sets, 0)).toBe("W");
    expect(setColumnLabel(sets, 1)).toBe("1");
    expect(setColumnLabel(sets, 2)).toBe("2");
  });
});
