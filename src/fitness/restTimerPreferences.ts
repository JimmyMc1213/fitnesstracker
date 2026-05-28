export const DEFAULT_REST_TIMER_SECONDS = 60;

/** Minimum rest duration users can set (prevents instant-skip exploits). */
export const MIN_REST_TIMER_SECONDS = 15;

/** Maximum rest duration users can set (prevents absurd values / storage abuse). */
export const MAX_REST_TIMER_SECONDS = 600;

export const REST_TIMER_PRESETS = [30, 60, 90, 120] as const;

export type RestTimerPreset = (typeof REST_TIMER_PRESETS)[number];

export function clampRestTimerSeconds(raw: unknown, fallback = DEFAULT_REST_TIMER_SECONDS): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(MAX_REST_TIMER_SECONDS, Math.max(MIN_REST_TIMER_SECONDS, n)));
}

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

export function restDurationForExercise(
  name: string,
  label: string | undefined,
  defaultSeconds: number,
  byExerciseKey: Record<string, number>,
  keyFn: (name: string, label?: string) => string,
): number {
  const key = keyFn(name, label);
  const override = byExerciseKey[key];
  if (override != null) return override;
  return normalizeRestTimerDefaultSeconds(defaultSeconds);
}

export function nextRestTimerPreset(current: number): RestTimerPreset {
  const idx = REST_TIMER_PRESETS.indexOf(current as RestTimerPreset);
  if (idx === -1) {
    const closest = REST_TIMER_PRESETS.reduce((best, p) =>
      Math.abs(p - current) < Math.abs(best - current) ? p : best,
    );
    const closestIdx = REST_TIMER_PRESETS.indexOf(closest);
    return REST_TIMER_PRESETS[(closestIdx + 1) % REST_TIMER_PRESETS.length];
  }
  return REST_TIMER_PRESETS[(idx + 1) % REST_TIMER_PRESETS.length];
}

export function formatRestDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
}
