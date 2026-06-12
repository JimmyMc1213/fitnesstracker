export const DEFAULT_REST_TIMER_SECONDS = 60;

/** Minimum rest duration users can set (prevents instant-skip exploits). */
export const MIN_REST_TIMER_SECONDS = 15;

/** Maximum rest duration users can set (prevents absurd values / storage abuse). */
export const MAX_REST_TIMER_SECONDS = 600;

export function normalizeRestTimerDefaultSeconds(raw: unknown): number {
  const n = typeof raw === "number" ? raw : DEFAULT_REST_TIMER_SECONDS;
  if (!Number.isFinite(n) || n < MIN_REST_TIMER_SECONDS || n > MAX_REST_TIMER_SECONDS) {
    return DEFAULT_REST_TIMER_SECONDS;
  }
  return Math.round(n);
}

export function normalizeRestTimerSecondsByExerciseKey(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string") continue;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n < MIN_REST_TIMER_SECONDS || n > MAX_REST_TIMER_SECONDS) continue;
    out[k] = Math.round(n);
  }
  return out;
}

export function mergeRestTimerSecondsByExerciseKey(
  local: Record<string, number>,
  remote: Record<string, number>,
): Record<string, number> {
  return {
    ...normalizeRestTimerSecondsByExerciseKey(local),
    ...normalizeRestTimerSecondsByExerciseKey(remote),
  };
}
