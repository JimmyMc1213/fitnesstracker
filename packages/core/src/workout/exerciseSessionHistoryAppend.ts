import type { ExerciseSessionSnapshot, WorkoutExercise, WorkoutState } from "@newyouai/types";

import { MAX_SESSION_HISTORY } from "../sync/exerciseSessionHistoryMerge";
import { exerciseNoteKey } from "./exerciseNoteKey";
import { sessionBestForExercise } from "./workoutSummarySession";

function sessionVolume(exercise: WorkoutExercise): number {
  return exercise.sets.filter((s) => s.done).reduce((a, s) => a + s.w * s.r, 0);
}

function snapshotFromExercise(exercise: WorkoutExercise, dayKey: string, endedAtMs: number): ExerciseSessionSnapshot | null {
  const best = sessionBestForExercise(exercise.sets);
  if (!best || (best.w <= 0 && best.r <= 0)) return null;
  return {
    dayKey,
    endedAtMs,
    bestWeight: best.w,
    bestReps: best.r,
    volume: sessionVolume(exercise),
  };
}

/** Append this session's exercise bests; keeps newest `MAX_SESSION_HISTORY` per key. */
export function appendExerciseSessionHistory(
  history: Record<string, ExerciseSessionSnapshot[]>,
  workout: WorkoutState,
  endedAtMs: number,
): Record<string, ExerciseSessionSnapshot[]> {
  const dayKey = workout.sessionDayKey ?? new Date(endedAtMs).toISOString().slice(0, 10);
  let next = { ...history };

  for (const ex of workout.exercises) {
    const snap = snapshotFromExercise(ex, dayKey, endedAtMs);
    if (!snap) continue;
    const key = exerciseNoteKey(ex.name, ex.label);
    const prev = next[key] ?? [];
    const withoutDup = prev.filter((s) => s.endedAtMs !== endedAtMs);
    const merged = [...withoutDup, snap].sort((a, b) => a.endedAtMs - b.endedAtMs);
    next = { ...next, [key]: merged.slice(-MAX_SESSION_HISTORY) };
  }

  return next;
}

export function getExerciseSessionHistory(
  history: Record<string, ExerciseSessionSnapshot[]> | undefined,
  name: string,
  label?: string,
): ExerciseSessionSnapshot[] {
  return (history ?? {})[exerciseNoteKey(name, label)] ?? [];
}
