import { describe, expect, it } from "vitest";

import type { CompletedWorkoutSession } from "./types";
import { previousSetLinesForExercise, setFieldPlaceholder } from "./workoutPreviousSets";

describe("workoutPreviousSets", () => {
  it("formats per-set previous lines from last session", () => {
    const history: CompletedWorkoutSession[] = [
      {
        id: "s1",
        dayKey: "2026-05-10",
        endedAtMs: 1000,
        startedAtMs: 0,
        title: "Upper",
        durationSec: 60,
        exercises: [
          {
            id: "e1",
            name: "Bench Press",
            target: "3 × 8",
            sets: [
              { w: 135, r: 8, done: true },
              { w: 135, r: 7, done: true },
            ],
          },
        ],
      },
    ];
    const lines = previousSetLinesForExercise(history, "Bench Press", undefined, 2, "lbs");
    expect(lines[0]).toContain("135");
    expect(lines[1]).toContain("135");
  });

  it("returns dashes when no history", () => {
    expect(previousSetLinesForExercise([], "Squat", undefined, 2, "lbs")).toEqual(["—", "—"]);
  });

  it("uses history for the first set placeholder", () => {
    const history = [
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ];
    const sets = [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ];
    expect(setFieldPlaceholder(sets, 0, history)).toEqual({ w: 135, r: 8 });
    expect(setFieldPlaceholder(sets, 1, history)).toEqual({ w: 135, r: 7 });
  });

  it("uses the previous logged set for added sets", () => {
    const history = [{ w: 135, r: 8, done: false }];
    const sets = [
      { w: 140, r: 6, done: true },
      { w: 0, r: 0, done: false },
    ];
    expect(setFieldPlaceholder(sets, 1, history)).toEqual({ w: 140, r: 6 });
  });

  it("inherits placeholder from the previous row for added sets", () => {
    const history = [
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ];
    const sets = [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ];
    expect(setFieldPlaceholder(sets, 3, history)).toEqual({ w: 135, r: 7 });
  });
});
