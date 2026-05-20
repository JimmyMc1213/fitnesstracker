import { exerciseNoteKey } from "./exerciseNotes";
import type { ExerciseSessionSnapshot, WorkoutExercise, WorkoutState } from "./types";
import { sessionBestForExercise } from "./workoutSummary";

export const MAX_SESSION_HISTORY = 10;

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

export function normalizeExerciseSessionHistoryByKey(raw: unknown): Record<string, ExerciseSessionSnapshot[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, ExerciseSessionSnapshot[]> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!k.trim() || !Array.isArray(v)) continue;
    const snaps: ExerciseSessionSnapshot[] = [];
    for (const item of v) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const dayKey = typeof o.dayKey === "string" ? o.dayKey : "";
      const endedAtMs = Number(o.endedAtMs);
      const bestWeight = Number(o.bestWeight);
      const bestReps = Number(o.bestReps);
      const volume = Number(o.volume);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey) || !Number.isFinite(endedAtMs)) continue;
      if (!Number.isFinite(bestWeight) || !Number.isFinite(bestReps)) continue;
      if (bestWeight <= 0 && bestReps <= 0) continue;
      snaps.push({
        dayKey,
        endedAtMs,
        bestWeight,
        bestReps,
        volume: Number.isFinite(volume) ? volume : 0,
      });
    }
    if (snaps.length) {
      out[k] = snaps.sort((a, b) => a.endedAtMs - b.endedAtMs).slice(-MAX_SESSION_HISTORY);
    }
  }
  return out;
}

export function mergeExerciseSessionHistoryByKey(
  a: Record<string, ExerciseSessionSnapshot[]>,
  b: Record<string, ExerciseSessionSnapshot[]>,
): Record<string, ExerciseSessionSnapshot[]> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, ExerciseSessionSnapshot[]> = {};
  for (const k of keys) {
    const byEnd = new Map<number, ExerciseSessionSnapshot>();
    for (const s of [...(a[k] ?? []), ...(b[k] ?? [])]) byEnd.set(s.endedAtMs, s);
    out[k] = [...byEnd.values()].sort((x, y) => x.endedAtMs - y.endedAtMs).slice(-MAX_SESSION_HISTORY);
  }
  return out;
}
