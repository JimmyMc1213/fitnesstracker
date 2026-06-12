import type { CompletedWorkoutSession } from "@newyouai/types";

export const MAX_WORKOUT_HISTORY = 200;

export function getWorkoutHistorySorted(
  history: CompletedWorkoutSession[] | undefined,
): CompletedWorkoutSession[] {
  return [...(history ?? [])].sort((a, b) => b.endedAtMs - a.endedAtMs);
}

export function mergeWorkoutHistory(
  a: CompletedWorkoutSession[],
  b: CompletedWorkoutSession[],
): CompletedWorkoutSession[] {
  const byKey = new Map<string, CompletedWorkoutSession>();
  for (const s of [...a, ...b]) {
    const prev = byKey.get(s.id) ?? byKey.get(`t:${s.endedAtMs}`);
    if (!prev || s.endedAtMs >= prev.endedAtMs) {
      byKey.set(s.id, s);
      byKey.set(`t:${s.endedAtMs}`, s);
    }
  }
  const unique = new Map<string, CompletedWorkoutSession>();
  for (const s of byKey.values()) unique.set(s.id, s);
  return getWorkoutHistorySorted([...unique.values()]).slice(0, MAX_WORKOUT_HISTORY);
}
