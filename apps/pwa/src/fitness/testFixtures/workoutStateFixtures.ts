/**
 * WorkoutState fixtures for coach.ts unit tests and FTI-34 coachEngine snapshot tests.
 * No React or DOM imports, safe for Vitest node environment.
 */
import type { WorkoutExercise, WorkoutState } from "../types";

function baseExercise(name: string, sets: WorkoutExercise["sets"]): WorkoutExercise {
  return {
    id: "ex-1",
    name,
    target: "3 × 10",
    sets,
  };
}

function workoutWithPrimary(exercise: WorkoutExercise): WorkoutState {
  return {
    splitId: "mon-upper",
    startedAt: "2026-05-21T08:00:00",
    sessionDayKey: "2026-05-21",
    sessionPhase: "lifting",
    sessionTitle: "Upper strength",
    sessionStartedAtMs: Date.now(),
    exercises: [exercise],
  };
}

export const workoutStateFixtures = {
  empty: {
    splitId: "mon-upper",
    startedAt: "2026-05-21T08:00:00",
    sessionDayKey: "2026-05-21",
    sessionPhase: "lifting" as const,
    sessionTitle: "Upper strength",
    sessionStartedAtMs: Date.now(),
    exercises: [],
  } satisfies WorkoutState,

  incompleteWithWeightReps: workoutWithPrimary(
    baseExercise("Bench Press", [
      { w: 135, r: 8, done: false },
      { w: 0, r: 0, done: false },
    ]),
  ),

  incompleteWeightOnly: workoutWithPrimary(
    baseExercise("Squat", [
      { w: 185, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]),
  ),

  incompleteBlankSet: workoutWithPrimary(
    baseExercise("Deadlift", [
      { w: 0, r: 0, done: false },
      { w: 0, r: 0, done: false },
    ]),
  ),

  allSetsDone: workoutWithPrimary(
    baseExercise("Overhead Press", [
      { w: 95, r: 8, done: true },
      { w: 95, r: 10, done: true },
      { w: 95, r: 6, done: true },
    ]),
  ),
};
