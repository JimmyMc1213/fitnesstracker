import { describe, expect, it } from "vitest";

import { progressiveOverloadInsight } from "./coach";
import { workoutStateFixtures } from "./testFixtures/workoutStateFixtures";

describe("progressiveOverloadInsight", () => {
  it("returns no-exercises message when exercise list is empty", () => {
    const msg = progressiveOverloadInsight(workoutStateFixtures.empty);
    expect(msg).toContain("Log every working set");
    expect(msg).toContain("boring consistency");
  });

  it("returns incomplete set message with weight and reps", () => {
    const msg = progressiveOverloadInsight(workoutStateFixtures.incompleteWithWeightReps);
    expect(msg).toContain("Bench Press");
    expect(msg).toContain("135 lb");
    expect(msg).toContain("8");
    expect(msg).toContain("Finish logging");
  });

  it("returns incomplete set message with weight only (no reps)", () => {
    const msg = progressiveOverloadInsight(workoutStateFixtures.incompleteWeightOnly);
    expect(msg).toContain("Squat");
    expect(msg).toContain("185 lb");
    expect(msg).toContain("Add reps");
  });

  it("returns incomplete blank set message when weight and reps are zero", () => {
    const msg = progressiveOverloadInsight(workoutStateFixtures.incompleteBlankSet);
    expect(msg).toContain("Deadlift");
    expect(msg).toContain("Lead with");
    expect(msg).toContain("10 reps");
  });

  it("returns no-completed-sets message when all sets are done but none have weight×reps", () => {
    const w = {
      ...workoutStateFixtures.incompleteBlankSet,
      exercises: [
        {
          ...workoutStateFixtures.incompleteBlankSet.exercises[0]!,
          sets: [
            { w: 0, r: 0, done: true },
            { w: 0, r: 0, done: true },
          ],
        },
      ],
    };
    const msg = progressiveOverloadInsight(w);
    expect(msg).toContain("Track weight × reps");
    expect(msg).toContain("Deadlift");
  });

  it("returns completed-set progression summary with max weight and reps", () => {
    const msg = progressiveOverloadInsight(workoutStateFixtures.allSetsDone);
    expect(msg).toContain("Overhead Press");
    expect(msg).toContain("95 lb");
    expect(msg).toContain("10 reps logged");
    expect(msg).toContain("Solid work");
    expect(msg).toContain("10 reps (top of 10 reps)");
    expect(msg).toContain("add ~5 lb");
  });
});
