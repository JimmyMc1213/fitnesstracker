import { describe, expect, it } from "vitest";

import {
  autofillExerciseSets,
  autofillSetsForTemplateCount,
  buildSetsForExercise,
  findLastLoggedExerciseSets,
} from "./workoutAutofill";
import { workoutHistoryAppState } from "./testFixtures/appStateFixtures";
import type { CompletedWorkoutSession, WorkoutExercise } from "./types";

function benchSession(
  id: string,
  endedAtMs: number,
  sets: { w: number; r: number }[],
  label?: string,
): CompletedWorkoutSession {
  return {
    id,
    dayKey: "2026-05-20",
    endedAtMs,
    startedAtMs: endedAtMs - 3600_000,
    title: "Push",
    durationSec: 3600,
    exercises: [
      {
        id: `ex-${id}`,
        name: "Bench Press",
        label,
        target: "3×8",
        sets: sets.map((s) => ({ ...s, done: true })),
      },
    ],
  };
}

describe("findLastLoggedExerciseSets", () => {
  it("returns last session sets for matching exercise", () => {
    const state = workoutHistoryAppState([
      benchSession("older", 1_000_000, [
        { w: 125, r: 8 },
        { w: 125, r: 8 },
        { w: 125, r: 7 },
      ]),
      benchSession("newer", 2_000_000, [
        { w: 135, r: 8 },
        { w: 135, r: 8 },
        { w: 135, r: 7 },
      ]),
    ]);
    const sets = findLastLoggedExerciseSets(state.workoutHistory, "Bench Press");
    expect(sets).toEqual([
      { w: 135, r: 8, done: false },
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ]);
  });

  it("returns most recent session when multiple exist", () => {
    const state = workoutHistoryAppState([
      benchSession("session-a", 5_000_000, [{ w: 100, r: 10 }]),
      benchSession("session-b", 9_000_000, [{ w: 155, r: 5 }]),
      benchSession("session-c", 7_000_000, [{ w: 145, r: 6 }]),
    ]);
    const sets = findLastLoggedExerciseSets(state.workoutHistory, "Bench Press");
    expect(sets?.[0]).toEqual({ w: 155, r: 5, done: false });
  });

  it("matches label disambiguation", () => {
    const state = workoutHistoryAppState([
      {
        id: "mixed",
        dayKey: "2026-05-21",
        endedAtMs: 3_000_000,
        startedAtMs: 2_999_000,
        title: "Push",
        durationSec: 1000,
        exercises: [
          {
            id: "barbell",
            name: "Bench Press",
            label: "Barbell",
            target: "3×8",
            sets: [{ w: 135, r: 8, done: true }],
          },
          {
            id: "dumbbell",
            name: "Bench Press",
            label: "Dumbbell",
            target: "3×10",
            sets: [{ w: 60, r: 10, done: true }],
          },
        ],
      },
    ]);
    const barbell = findLastLoggedExerciseSets(state.workoutHistory, "Bench Press", "Barbell");
    const dumbbell = findLastLoggedExerciseSets(state.workoutHistory, "Bench Press", "Dumbbell");
    expect(barbell?.[0]).toEqual({ w: 135, r: 8, done: false });
    expect(dumbbell?.[0]).toEqual({ w: 60, r: 10, done: false });
  });

  it("returns null when no match", () => {
    const state = workoutHistoryAppState([benchSession("only", 1_000_000, [{ w: 135, r: 8 }])]);
    expect(findLastLoggedExerciseSets(state.workoutHistory, "Squat")).toBeNull();
    expect(findLastLoggedExerciseSets(undefined, "Bench Press")).toBeNull();
  });
});

describe("autofillSetsForTemplateCount", () => {
  const lastSets = [
    { w: 135, r: 8, done: false },
    { w: 135, r: 8, done: false },
    { w: 135, r: 7, done: false },
    { w: 140, r: 6, done: false },
  ];

  it("maps first N historical sets when template has fewer sets", () => {
    const sets = autofillSetsForTemplateCount(3, lastSets);
    expect(sets).toEqual([
      { w: 135, r: 8, done: false },
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ]);
  });

  it("pads extra template sets with last historical w/r", () => {
    const sets = autofillSetsForTemplateCount(5, lastSets);
    expect(sets).toEqual([
      { w: 135, r: 8, done: false },
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
      { w: 140, r: 6, done: false },
      { w: 140, r: 6, done: false },
    ]);
  });

  it("returns blank sets when history is null or empty", () => {
    expect(autofillSetsForTemplateCount(3, null)).toEqual([
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]);
    expect(autofillSetsForTemplateCount(2, [])).toEqual([
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]);
  });
});

describe("autofillExerciseSets", () => {
  it("applies autofill to exercise set count", () => {
    const exercise: WorkoutExercise = {
      id: "bench-1",
      name: "Bench Press",
      target: "3×8",
      sets: [
        { w: 0, r: 0, done: false },
        { w: 0, r: 0, done: false },
        { w: 0, r: 0, done: false },
      ],
    };
    const state = workoutHistoryAppState([
      benchSession("hist", 1_000_000, [
        { w: 135, r: 8 },
        { w: 135, r: 8 },
        { w: 135, r: 7 },
      ]),
    ]);
    const filled = autofillExerciseSets(exercise, state.workoutHistory);
    expect(filled.sets).toEqual([
      { w: 135, r: 8, done: false },
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ]);
    expect(filled.id).toBe(exercise.id);
  });
});

describe("buildSetsForExercise", () => {
  it("delegates to history lookup and set-count alignment", () => {
    const state = workoutHistoryAppState([
      benchSession("hist", 1_000_000, [
        { w: 135, r: 8 },
        { w: 135, r: 8 },
        { w: 135, r: 7 },
      ]),
    ]);
    expect(buildSetsForExercise("Bench Press", undefined, 3, state.workoutHistory)).toEqual([
      { w: 135, r: 8, done: false },
      { w: 135, r: 8, done: false },
      { w: 135, r: 7, done: false },
    ]);
    expect(buildSetsForExercise("Squat", undefined, 3, state.workoutHistory)).toEqual([
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]);
  });
});
