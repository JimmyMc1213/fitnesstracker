import type { ExercisePersonalBest } from "./types";

export {
  normalizeExerciseKey,
  sessionBestForExercise,
  buildWorkoutSessionSummary,
  personalBestsAfterSession,
  formatWorkoutDuration,
} from "@newyouai/core";

/** Parse targets like "4 × 5-8", "3 x 10", "3 × 10-12". */
export function parseWorkoutTarget(target: string): { repMin: number; repMax: number } | null {
  const m = target.trim().match(/(\d+)\s*[×x]\s*(\d+)(?:\s*[–\-]\s*(\d+))?/i);
  if (!m) return null;
  const repMin = Number(m[2]);
  const repMax = m[3] != null ? Number(m[3]) : repMin;
  if (!Number.isFinite(repMin) || !Number.isFinite(repMax)) return null;
  return { repMin: Math.min(repMin, repMax), repMax: Math.max(repMin, repMax) };
}

export function mergeExercisePersonalBests(
  a: Record<string, ExercisePersonalBest>,
  b: Record<string, ExercisePersonalBest>,
): Record<string, ExercisePersonalBest> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, ExercisePersonalBest> = { ...a };
  for (const k of keys) {
    const la = a[k];
    const rb = b[k];
    if (!la) out[k] = { ...rb! };
    else if (!rb) out[k] = { ...la };
    else {
      out[k] = {
        maxWeight: Math.max(la.maxWeight, rb.maxWeight),
        maxReps: Math.max(la.maxReps, rb.maxReps),
      };
    }
  }
  return out;
}
