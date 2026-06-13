import type {
  ExercisePersonalBest,
  WeightUnit,
  WorkoutExercise,
  WorkoutSessionSummary,
  WorkoutSet,
  WorkoutState,
} from "@newyouai/types";

import { formatSetWeight, weightUnitLabel } from "./unitDisplay";
import { getExerciseRepBounds } from "./workoutTarget";

export function normalizeExerciseKey(name: string): string {
  return name.trim().toLowerCase();
}

function formatSetDetail(w: number, r: number, weightUnit: WeightUnit): string {
  if (w > 0) return `${formatSetWeight(w, weightUnit)} ${weightUnitLabel(weightUnit)} × ${r} rep${r === 1 ? "" : "s"}`;
  return `${r} rep${r === 1 ? "" : "s"}`;
}

function isBetterSet(w: number, r: number, best: ExercisePersonalBest): boolean {
  if (w > best.maxWeight) return true;
  if (w === best.maxWeight && r > best.maxReps) return true;
  if (w < best.maxWeight && r > best.maxReps) return true;
  return false;
}

export function sessionBestForExercise(sets: WorkoutSet[]): { w: number; r: number } | null {
  let best: { w: number; r: number } | null = null;
  for (const st of sets) {
    if (!st.done || (st.w <= 0 && st.r <= 0)) continue;
    if (!best || isBetterSet(st.w, st.r, { maxWeight: best.w, maxReps: best.r })) {
      best = { w: st.w, r: st.r };
    }
  }
  return best;
}

function updateBestFromSet(
  bests: Record<string, ExercisePersonalBest>,
  name: string,
  w: number,
  r: number,
): Record<string, ExercisePersonalBest> {
  const key = normalizeExerciseKey(name);
  const prev = bests[key] ?? { maxWeight: 0, maxReps: 0 };
  const next: ExercisePersonalBest = {
    maxWeight: Math.max(prev.maxWeight, w),
    maxReps: Math.max(prev.maxReps, r),
  };
  if (w === prev.maxWeight && r > prev.maxReps) next.maxReps = r;
  if (w > prev.maxWeight) {
    next.maxWeight = w;
    next.maxReps = Math.max(prev.maxReps, r);
  }
  return { ...bests, [key]: next };
}

export function buildWorkoutSessionSummary(
  workout: WorkoutState,
  personalBests: Record<string, ExercisePersonalBest>,
  endedAtMs: number,
  weightUnit: WeightUnit = "lbs",
): WorkoutSessionSummary {
  const durationSec =
    workout.sessionStartedAtMs != null
      ? Math.max(0, Math.floor((endedAtMs - workout.sessionStartedAtMs) / 1000))
      : 0;

  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = workout.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalVolume = workout.exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.done).reduce((b, st) => b + st.w * st.r, 0),
    0,
  );

  const prs: WorkoutSessionSummary["prs"] = [];
  const needsWork: WorkoutSessionSummary["needsWork"] = [];

  for (const ex of workout.exercises) {
    const key = normalizeExerciseKey(ex.name);
    const prev = personalBests[key] ?? { maxWeight: 0, maxReps: 0 };
    const sessionBest = sessionBestForExercise(ex.sets);

    if (sessionBest) {
      const hadPrior = prev.maxWeight > 0 || prev.maxReps > 0;
      const isPr =
        hadPrior &&
        (sessionBest.w > prev.maxWeight ||
          (sessionBest.w === prev.maxWeight && sessionBest.r > prev.maxReps) ||
          (sessionBest.w < prev.maxWeight && sessionBest.r > prev.maxReps));

      if (isPr) {
        prs.push({
          exerciseName: ex.name,
          detail: formatSetDetail(sessionBest.w, sessionBest.r, weightUnit),
        });
      }
    }

    const { low: repMin, high: repMax } = getExerciseRepBounds(ex);
    ex.sets.forEach((st, idx) => {
      if (!st.done || st.r <= 0) return;
      if (st.r < repMin) {
        needsWork.push({
          exerciseName: ex.name,
          detail: `Set ${idx + 1}: ${st.r} reps (target ${repMin}${repMax !== repMin ? `–${repMax}` : ""})`,
        });
      }
    });
  }

  return {
    title: workout.sessionTitle.trim() || "Workout",
    durationSec,
    doneSets,
    totalSets,
    totalVolume,
    prs,
    needsWork,
  };
}

export function personalBestsAfterSession(
  exercises: WorkoutExercise[],
  personalBests: Record<string, ExercisePersonalBest>,
): Record<string, ExercisePersonalBest> {
  let next = { ...personalBests };
  for (const ex of exercises) {
    for (const st of ex.sets) {
      if (!st.done || (st.w <= 0 && st.r <= 0)) continue;
      next = updateBestFromSet(next, ex.name, st.w, st.r);
    }
  }
  return next;
}

export function formatWorkoutDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
