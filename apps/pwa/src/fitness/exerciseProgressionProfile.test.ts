import { describe, expect, it } from "vitest";

import {
  REPS_ONLY_ADD_WEIGHT_THRESHOLD,
  getExerciseProgressionKind,
} from "./exerciseProgressionProfile";
import type { WorkoutExercise } from "./types";

function ex(name: string, target = "3 × 8-12"): WorkoutExercise {
  return {
    id: "e1",
    name,
    target,
    sets: [{ w: 0, r: 0, done: false }],
  };
}

describe("exerciseProgressionProfile", () => {
  it("classifies standard lifts as weight_reps", () => {
    expect(getExerciseProgressionKind(ex("Leg extension"), [])).toBe("weight_reps");
    expect(getExerciseProgressionKind(ex("Barbell bench press"), [])).toBe("weight_reps");
  });

  it("classifies holds as time_seconds", () => {
    expect(getExerciseProgressionKind(ex("Wall sit", "3 × 30"), [])).toBe("time_seconds");
    expect(getExerciseProgressionKind(ex("Plank", "3 × 45"), [])).toBe("time_seconds");
  });

  it("classifies carries as dual time/weight", () => {
    expect(getExerciseProgressionKind(ex("Farmers carry"), [])).toBe("time_seconds_or_meters");
  });

  it("classifies bodyweight skill work as reps_only", () => {
    expect(getExerciseProgressionKind(ex("Burpee"), [])).toBe("reps_only");
    expect(getExerciseProgressionKind(ex("Nordic hamstring curl"), [])).toBe("reps_only");
  });

  it("classifies activation work as none", () => {
    expect(getExerciseProgressionKind(ex("Frog pump"), [])).toBe("none");
    expect(getExerciseProgressionKind(ex("Jump rope calf raises"), [])).toBe("none");
  });

  it("switches bench dip to weight_reps after load is logged", () => {
    expect(getExerciseProgressionKind(ex("Bench dip"), [])).toBe("reps_only");
    expect(getExerciseProgressionKind(ex("Bench dip"), [{ w: 25, r: 10 }])).toBe("weight_reps");
  });

  it("exports add-weight threshold constant", () => {
    expect(REPS_ONLY_ADD_WEIGHT_THRESHOLD).toBe(20);
  });
});
