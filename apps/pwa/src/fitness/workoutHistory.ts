import { appendWorkoutHistory, buildCompletedWorkoutSession, getWorkoutHistorySorted } from "@newyouai/core";
import type { CompletedWorkoutSession, WorkoutExercise, WorkoutSet } from "./types";

export { appendWorkoutHistory, buildCompletedWorkoutSession, getWorkoutHistorySorted };

export const MAX_WORKOUT_HISTORY = 200;

export function removeWorkoutFromHistory(
  history: CompletedWorkoutSession[],
  sessionId: string,
): CompletedWorkoutSession[] {
  return history.filter((s) => s.id !== sessionId);
}

/** Rebuild completion flags from saved sessions (e.g. after delete). */
export function workoutsCompletedByDayFromHistory(
  history: CompletedWorkoutSession[],
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const s of history) out[s.dayKey] = true;
  return out;
}

export function getWorkoutsForDay(
  history: CompletedWorkoutSession[] | undefined,
  dayKey: string,
): CompletedWorkoutSession[] {
  return getWorkoutHistorySorted(history).filter((s) => s.dayKey === dayKey);
}

export function formatWorkoutHistoryDate(dayKey: string, endedAtMs: number): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dayKey)
    ? new Date(`${dayKey}T12:00:00`)
    : new Date(endedAtMs);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function workoutDaysInMonth(
  history: CompletedWorkoutSession[] | undefined,
  year: number,
  monthIndex: number,
): Set<string> {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const days = new Set<string>();
  for (const s of history ?? []) {
    if (s.dayKey.startsWith(prefix)) days.add(s.dayKey);
  }
  return days;
}

export function workoutDaysInYear(
  history: CompletedWorkoutSession[] | undefined,
  year: number,
): Set<string> {
  const prefix = `${year}-`;
  const days = new Set<string>();
  for (const s of history ?? []) {
    if (s.dayKey.startsWith(prefix)) days.add(s.dayKey);
  }
  return days;
}

export function workoutYearsFromHistory(history: CompletedWorkoutSession[] | undefined): number[] {
  const years = new Set<number>();
  for (const s of history ?? []) {
    const y = Number(s.dayKey.slice(0, 4));
    if (Number.isFinite(y)) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

function normalizeWorkoutSet(raw: unknown): WorkoutSet | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const w = Number(o.w);
  const r = Number(o.r);
  if (!Number.isFinite(w) || !Number.isFinite(r)) return null;
  if (w <= 0 && r <= 0) return null;
  return { w, r, done: true };
}

function normalizeWorkoutExercise(raw: unknown): WorkoutExercise | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;
  const name = o.name.trim();
  if (!name) return null;
  const sets: WorkoutSet[] = [];
  if (Array.isArray(o.sets)) {
    for (const st of o.sets) {
      const norm = normalizeWorkoutSet(st);
      if (norm) sets.push(norm);
    }
  }
  if (sets.length === 0) return null;
  return {
    id: o.id,
    name,
    label: typeof o.label === "string" && o.label.trim() ? o.label.trim() : undefined,
    target: typeof o.target === "string" ? o.target : "",
    sets,
  };
}

export function normalizeWorkoutHistory(raw: unknown): CompletedWorkoutSession[] {
  if (!Array.isArray(raw)) return [];
  const out: CompletedWorkoutSession[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const endedAtMs = Number(o.endedAtMs);
    const startedAtMs = Number(o.startedAtMs);
    const durationSec = Number(o.durationSec);
    const dayKey = typeof o.dayKey === "string" ? o.dayKey : "";
    const id = typeof o.id === "string" ? o.id : "";
    const title = typeof o.title === "string" ? o.title.trim() : "";
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey) || !Number.isFinite(endedAtMs)) continue;
    const exercises: WorkoutExercise[] = [];
    if (Array.isArray(o.exercises)) {
      for (const ex of o.exercises) {
        const norm = normalizeWorkoutExercise(ex);
        if (norm) exercises.push(norm);
      }
    }
    if (exercises.length === 0) continue;
    out.push({
      id,
      dayKey,
      endedAtMs,
      startedAtMs: Number.isFinite(startedAtMs) ? startedAtMs : endedAtMs,
      title: title || "Workout",
      durationSec: Number.isFinite(durationSec) ? Math.max(0, Math.round(durationSec)) : 0,
      exercises,
    });
  }
  return getWorkoutHistorySorted(out).slice(0, MAX_WORKOUT_HISTORY);
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
