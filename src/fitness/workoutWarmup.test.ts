import { describe, expect, it } from "vitest";

import type { WorkoutExercise } from "./types";
import { buildWorkoutWarmup } from "./workoutWarmup";

function ex(name: string, id = name): WorkoutExercise {
  return { id, name, target: "3x8-12", sets: [{ w: 0, r: 0, done: false }] };
}

function planText(plan: ReturnType<typeof buildWorkoutWarmup>): string {
  return plan.groups
    .flatMap((group) => group.drills.flatMap((drill) => [drill.name, drill.prescription, drill.note].filter(Boolean)))
    .join(" ");
}

describe("buildWorkoutWarmup", () => {
  it("returns a minimal plan when there are no exercises", () => {
    const plan = buildWorkoutWarmup([]);
    expect(plan.groups).toHaveLength(1);
    expect(plan.groups[0]?.label).toBe("General");
    expect(plan.groups[0]?.drills[0]?.name).toBe("Easy cardio");
    expect(plan.groups[0]?.drills[0]?.prescription).toMatch(/5–8 min/i);
  });

  it("groups push-day prep under chest and shoulders", () => {
    const plan = buildWorkoutWarmup([
      ex("Barbell bench press"),
      ex("Barbell overhead press"),
      ex("Tricep pushdown"),
    ]);

    expect(plan.groups.map((g) => g.label)).toEqual([
      "General",
      "Chest & shoulders",
      "Arms",
      "Ramp sets",
    ]);
    expect(plan.groups[1]?.drills[0]).toEqual({ name: "Band pull-aparts", prescription: "2 × 15" });
    expect(plan.groups[3]?.drills[0]?.name).toBe("Barbell bench press");
    expect(plan.groups[3]?.drills[0]?.prescription).toBe("2–4 sets");
    expect(plan.tip).toMatch(/reps in reserve/i);
  });

  it("adds quad prep when a squat pattern is added to a push day", () => {
    const pushOnly = buildWorkoutWarmup([ex("Barbell bench press"), ex("Barbell overhead press")]);
    const pushWithSquat = buildWorkoutWarmup([
      ex("Barbell bench press"),
      ex("Barbell overhead press"),
      ex("Barbell back squat"),
    ]);

    expect(pushOnly.groups.some((g) => g.label === "Quads & glutes")).toBe(false);
    expect(pushWithSquat.groups.some((g) => g.label === "Quads & glutes")).toBe(true);
    expect(planText(pushWithSquat)).toMatch(/Barbell back squat/i);
  });

  it("includes back and hamstring groups for deadlift days", () => {
    const plan = buildWorkoutWarmup([ex("Barbell deadlift"), ex("Barbell bent-over row")]);
    expect(plan.groups.map((g) => g.label)).toContain("Back & lats");
    expect(plan.groups.map((g) => g.label)).toContain("Hamstrings & glutes");
  });

  it("infers patterns for custom exercise names", () => {
    const plan = buildWorkoutWarmup([ex("Custom front squat variation", "custom-squat")]);
    expect(plan.groups.some((g) => g.label === "Quads & glutes")).toBe(true);
  });
});
