import { describe, expect, it } from "vitest";

import {
  buildSessionCoachNotesByExerciseId,
  getExerciseSessionNote,
  sanitizeCoachCopy,
} from "./exerciseSessionNotes";
import { getExerciseSessionNote as getExerciseSessionNoteFromEngine } from "./coachEngine";
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

function exercise(id: string, name: string, label?: string): WorkoutExercise {
  return {
    id,
    name,
    label,
    target: "3 × 8",
    sets: [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ],
  };
}

describe("sanitizeCoachCopy", () => {
  it("strips em dashes and multiplication signs from legacy notes", () => {
    const legacy =
      "Last session: 135×8, 135×8. Match or beat 135 lb × 8 — add ~5 lb when every set hits the top of the range.";
    expect(sanitizeCoachCopy(legacy)).toBe(
      "Last session: 135x8, 135x8. Match or beat 135 lb x 8, add ~5 lb when every set hits the top of the range.",
    );
  });
});

describe("getExerciseSessionNote", () => {
  it("returns progressive overload copy when history exists", () => {
    const state = workoutHistoryAppState([
      benchSession("hist", 2_000_000, [
        { w: 135, r: 8 },
        { w: 135, r: 8 },
        { w: 135, r: 7 },
      ]),
    ]);
    const note = getExerciseSessionNote({ workoutHistory: state.workoutHistory }, exercise("e1", "Bench Press"));
    expect(note).toContain("Last session: 135x8, 135x8, 135x7");
    expect(note).toContain("135x8 lb");
    expect(note).toContain("add ~5 lb");
  });

  it("returns generic tip when no history", () => {
    const note = getExerciseSessionNote({ workoutHistory: [] }, exercise("e1", "Squat"));
    expect(note).toContain("Lead with Squat");
    expect(note).toContain("1-2 reps in reserve");
    expect(note).not.toContain("Last session");
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
    const barbellNote = getExerciseSessionNote(
      { workoutHistory: state.workoutHistory },
      exercise("e1", "Bench Press", "Barbell"),
    );
    const dumbbellNote = getExerciseSessionNote(
      { workoutHistory: state.workoutHistory },
      exercise("e2", "Bench Press", "Dumbbell"),
    );
    expect(barbellNote).toContain("135x8");
    expect(dumbbellNote).toContain("60x10");
  });

  it("is re-exported from coachEngine", () => {
    const note = getExerciseSessionNoteFromEngine({ workoutHistory: [] }, exercise("e1", "Deadlift"));
    expect(note).toContain("Lead with Deadlift");
  });
});

describe("buildSessionCoachNotesByExerciseId", () => {
  it("maps notes by exercise id", () => {
    const ex1 = exercise("ex-a", "Bench Press");
    const ex2 = exercise("ex-b", "Squat");
    const state = workoutHistoryAppState([benchSession("hist", 1_000_000, [{ w: 135, r: 8 }])]);
    const notes = buildSessionCoachNotesByExerciseId(state.workoutHistory, [ex1, ex2]);
    expect(Object.keys(notes)).toEqual(["ex-a", "ex-b"]);
    expect(notes["ex-a"]).toContain("Last session");
    expect(notes["ex-b"]).toContain("Lead with Squat");
  });
});
