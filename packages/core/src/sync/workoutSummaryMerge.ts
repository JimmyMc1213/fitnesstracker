import type { ExercisePersonalBest } from "@newyouai/types";

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
