import type { CompletedWorkoutSession, WorkoutExercise, WorkoutSet, WorkoutState } from "@newyouai/types";

import { MAX_WORKOUT_HISTORY } from "../sync/workoutHistoryMerge";

function snapshotSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets
    .filter((s) => s.done && (s.w > 0 || s.r > 0))
    .map((s) => ({ w: s.w, r: s.r, done: true }));
}

function snapshotExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .map((ex) => ({
      id: ex.id,
      name: ex.name,
      label: ex.label,
      target: ex.target,
      sets: snapshotSets(ex.sets),
    }))
    .filter((ex) => ex.sets.length > 0);
}

function newSessionId(endedAtMs: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ws-${endedAtMs}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build a persisted session record from the active workout before it is cleared. */
export function buildCompletedWorkoutSession(
  workout: WorkoutState,
  endedAtMs: number,
  durationSec: number,
): CompletedWorkoutSession | null {
  const exercises = snapshotExercises(workout.exercises);
  if (exercises.length === 0) return null;

  const dayKey =
    workout.sessionDayKey ?? new Date(endedAtMs).toISOString().slice(0, 10);
  const startedAtMs = workout.sessionStartedAtMs ?? endedAtMs - durationSec * 1000;

  return {
    id: newSessionId(endedAtMs),
    dayKey,
    endedAtMs,
    startedAtMs,
    title: workout.sessionTitle.trim() || "Workout",
    durationSec: Math.max(0, Math.round(durationSec)),
    exercises,
  };
}

/** Prepend a session; dedupe by id or endedAtMs; cap list length. */
export function appendWorkoutHistory(
  history: CompletedWorkoutSession[],
  session: CompletedWorkoutSession,
): CompletedWorkoutSession[] {
  const withoutDup = history.filter(
    (s) => s.id !== session.id && s.endedAtMs !== session.endedAtMs,
  );
  return [session, ...withoutDup]
    .sort((a, b) => b.endedAtMs - a.endedAtMs)
    .slice(0, MAX_WORKOUT_HISTORY);
}
