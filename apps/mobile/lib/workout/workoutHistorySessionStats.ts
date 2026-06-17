import {
  exerciseNoteKey,
  formatSetWeight,
  getWorkoutHistorySorted,
  sessionBestForExercise,
  weightUnitLabel,
} from "@newyouai/core";
import type {
  CompletedWorkoutSession,
  ExercisePersonalBest,
  WeightUnit,
  WorkoutExercise,
} from "@newyouai/types";

export type HistoryExerciseRow = {
  setCount: number;
  name: string;
  label?: string;
  bestDetail: string;
};

export function sessionLoggedVolume(session: CompletedWorkoutSession): number {
  return session.exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.done).reduce((b, st) => b + st.w * st.r, 0),
    0,
  );
}

function bestsBeforeSession(
  history: CompletedWorkoutSession[],
  beforeEndedAtMs: number,
): Record<string, ExercisePersonalBest> {
  const out: Record<string, ExercisePersonalBest> = {};
  for (const session of getWorkoutHistorySorted(history)) {
    if (session.endedAtMs >= beforeEndedAtMs) continue;
    for (const ex of session.exercises) {
      const best = sessionBestForExercise(ex.sets);
      if (!best || (best.w <= 0 && best.r <= 0)) continue;
      const key = exerciseNoteKey(ex.name, ex.label);
      const prev = out[key] ?? { maxWeight: 0, maxReps: 0 };
      if (
        best.w > prev.maxWeight ||
        (best.w === prev.maxWeight && best.r > prev.maxReps) ||
        (best.w < prev.maxWeight && best.r > prev.maxReps)
      ) {
        out[key] = { maxWeight: best.w, maxReps: best.r };
      }
    }
  }
  return out;
}

export function countSessionPersonalRecords(
  session: CompletedWorkoutSession,
  history: CompletedWorkoutSession[] | undefined,
): number {
  const prior = bestsBeforeSession(history ?? [], session.endedAtMs);
  let count = 0;
  for (const ex of session.exercises) {
    const key = exerciseNoteKey(ex.name, ex.label);
    const prev = prior[key] ?? { maxWeight: 0, maxReps: 0 };
    const best = sessionBestForExercise(ex.sets);
    if (!best || (best.w <= 0 && best.r <= 0)) continue;
    const hadPrior = prev.maxWeight > 0 || prev.maxReps > 0;
    if (!hadPrior) continue;
    if (
      best.w > prev.maxWeight ||
      (best.w === prev.maxWeight && best.r > prev.maxReps) ||
      (best.w < prev.maxWeight && best.r > prev.maxReps)
    ) {
      count += 1;
    }
  }
  return count;
}

export function formatSessionVolume(volume: number, unit: WeightUnit): string {
  if (volume <= 0) return `0 ${weightUnitLabel(unit)}`;
  if (volume >= 1000) return `${Math.round(volume).toLocaleString()} ${weightUnitLabel(unit)}`;
  return `${Math.round(volume)} ${weightUnitLabel(unit)}`;
}

export function historyExerciseRows(
  session: CompletedWorkoutSession,
  unit: WeightUnit,
): HistoryExerciseRow[] {
  return session.exercises
    .map((ex) => ({
      setCount: ex.sets.filter((s) => s.done).length || ex.sets.length,
      name: ex.name,
      label: ex.label,
      bestDetail: formatExerciseBestSet(ex, unit),
    }))
    .filter((row) => row.bestDetail !== "-");
}

function formatExerciseBestSet(ex: WorkoutExercise, unit: WeightUnit): string {
  const best = sessionBestForExercise(ex.sets);
  if (!best || (best.w <= 0 && best.r <= 0)) return "-";
  if (best.w > 0) return `${formatSetWeight(best.w, unit)} ${weightUnitLabel(unit)} × ${best.r}`;
  return `${best.r} rep${best.r === 1 ? "" : "s"}`;
}
