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
      "Last session: 135×8, 135×8. Match or beat 135 lb × 8. Add ~5 lb when every set hits the top of the range.";
    expect(sanitizeCoachCopy(legacy)).toBe(
      "Last session: 135x8, 135x8. Match or beat 135 lb x 8. Add ~5 lb when every set hits the top of the range.",
    );
  });
});

describe("getExerciseSessionNote", () => {
  it("sets a specific rep progression goal when last session did not hit the top of the range", () => {
    const state = workoutHistoryAppState([
      benchSession("hist", 2_000_000, [
        { w: 135, r: 6 },
        { w: 135, r: 7 },
        { w: 135, r: 7 },
      ]),
    ]);
    const note = getExerciseSessionNote({ workoutHistory: state.workoutHistory }, exercise("e1", "Bench Press"));
    expect(note).toContain("Your goal: 135x8 on every set.");
    expect(note).toContain("If you miss reps, drop to 130x8");
    expect(note).not.toContain(" or ");
    expect(note).not.toContain("Last session:");
  });

  it("bumps weight when last session hit the top of the rep range", () => {
    const state = workoutHistoryAppState([
      benchSession("hist", 2_000_000, [
        { w: 135, r: 8 },
        { w: 135, r: 8 },
        { w: 135, r: 8 },
      ]),
    ]);
    const note = getExerciseSessionNote({ workoutHistory: state.workoutHistory }, exercise("e1", "Bench Press"));
    expect(note).toContain("Your goal: 140x8 on every set.");
    expect(note).toContain("If you miss reps, drop to 135x8");
  });

  it("returns a rep-range goal when no history", () => {
    const note = getExerciseSessionNote({ workoutHistory: [] }, exercise("e1", "Squat"));
    expect(note).toContain("Your goal: 8 reps on every set.");
    expect(note).toContain("Lock in your working weight on set 1.");
    expect(note).toContain("If you miss reps, drop 10 lb");
    expect(note).not.toContain(" or ");
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
      { ...exercise("e2", "Bench Press", "Dumbbell"), target: "3 × 10" },
    );
    expect(barbellNote).toContain("140x8");
    expect(dumbbellNote).toContain("65x10");
  });

  it("uses the high end of the rep range for weight progression", () => {
    const state = workoutHistoryAppState([
      benchSession("hist", 2_000_000, [{ w: 100, r: 12 }]),
    ]);
    const rangedExercise: WorkoutExercise = {
      ...exercise("e1", "Bench Press"),
      target: "3 × 8-12",
    };
    const note = getExerciseSessionNote({ workoutHistory: state.workoutHistory }, rangedExercise);
    expect(note).toContain("Your goal: 105x8 on every set.");
  });

  it("includes exercise focus from the library", () => {
    const note = getExerciseSessionNote({ workoutHistory: [] }, exercise("e1", "Barbell bench press"));
    expect(note).toContain("Retract scapula");
    expect(note).toContain("Your goal:");
  });

  it("is re-exported from coachEngine", () => {
    const note = getExerciseSessionNoteFromEngine({ workoutHistory: [] }, exercise("e1", "Barbell deadlift"));
    expect(note).toContain("Your goal:");
    expect(note).toContain("Bar over mid-foot");
  });
});

describe("buildSessionCoachNotesByExerciseId", () => {
  it("maps notes by exercise id", () => {
    const ex1 = exercise("ex-a", "Bench Press");
    const ex2 = exercise("ex-b", "Squat");
    const state = workoutHistoryAppState([benchSession("hist", 1_000_000, [{ w: 135, r: 8 }])]);
    const notes = buildSessionCoachNotesByExerciseId(state.workoutHistory, [ex1, ex2]);
    expect(Object.keys(notes)).toEqual(["ex-a", "ex-b"]);
    expect(notes["ex-a"]).toContain("140x8");
    expect(notes["ex-b"]).toContain("Your goal: 8 reps");
  });
});

describe("trainingStyle coach notes", () => {
  it("accountable style gives only the goal", () => {
    const state = workoutHistoryAppState([benchSession("hist", 1_000_000, [{ w: 135, r: 8 }])]);
    const note = getExerciseSessionNote(
      { workoutHistory: state.workoutHistory, trainingStyle: "accountable" },
      exercise("e1", "Bench Press"),
    );
    expect(note).toBe("140x8 on every set.");
  });

  it("flexible style keeps a single goal and adds substitute guidance only on struggle", () => {
    const note = getExerciseSessionNote(
      { workoutHistory: [], trainingStyle: "flexible" },
      exercise("e1", "Barbell back squat"),
    );
    expect(note).toContain("Your goal:");
    expect(note).toContain("break parallel");
    expect(note).toContain("If you miss reps, drop 10 lb");
    expect(note).toContain("close substitute");
    expect(note).not.toMatch(/Your goal:[^.]* or /);
  });

  it("beginner_guided keeps focus and reserves in the goal", () => {
    const note = getExerciseSessionNote(
      { workoutHistory: [], trainingStyle: "beginner_guided" },
      exercise("e1", "Barbell bench press"),
    );
    expect(note).toContain("Retract scapula");
    expect(note).toContain("leaving 1-2 reps in the tank");
    expect(note).toContain("If you miss reps");
  });
});
