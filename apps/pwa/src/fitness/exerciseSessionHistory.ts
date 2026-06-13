import { appendExerciseSessionHistory, getExerciseSessionHistory } from "@newyouai/core";
import type { ExerciseSessionSnapshot } from "./types";

export { appendExerciseSessionHistory, getExerciseSessionHistory };

export const MAX_SESSION_HISTORY = 10;

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
