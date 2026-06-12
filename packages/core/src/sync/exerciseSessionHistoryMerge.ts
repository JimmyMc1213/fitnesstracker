import type { ExerciseSessionSnapshot } from "@newyouai/types";

export const MAX_SESSION_HISTORY = 10;

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
