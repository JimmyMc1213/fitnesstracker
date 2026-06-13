import { exerciseNoteKey, normalizeRestTimerDefaultSeconds } from "@newyouai/core";

export const DEFAULT_REST_TIMER_SECONDS = 60;
export const MIN_REST_TIMER_SECONDS = 15;
export const MAX_REST_TIMER_SECONDS = 600;
export const REST_TIMER_PRESETS = [30, 60, 90, 120] as const;

export type RestTimerPreset = (typeof REST_TIMER_PRESETS)[number];

export function clampRestTimerSeconds(raw: unknown, fallback = DEFAULT_REST_TIMER_SECONDS): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(MAX_REST_TIMER_SECONDS, Math.max(MIN_REST_TIMER_SECONDS, n)));
}

export function restDurationForExercise(
  name: string,
  label: string | undefined,
  defaultSeconds: number,
  byExerciseKey: Record<string, number>,
): number {
  const key = exerciseNoteKey(name, label);
  const override = byExerciseKey[key];
  if (override != null) return override;
  return normalizeRestTimerDefaultSeconds(defaultSeconds);
}

export function formatRestDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
}
