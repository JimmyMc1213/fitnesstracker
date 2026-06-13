import { getWorkoutHistorySorted } from "@newyouai/core";
import type { CompletedWorkoutSession } from "@newyouai/types";

export { getWorkoutHistorySorted };

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

export function monthGroupLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return monthKey;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
}

function monthKeyFromDayKey(dayKey: string): string {
  return dayKey.slice(0, 7);
}

export function groupSessionsByMonth(
  sessions: CompletedWorkoutSession[],
): { monthKey: string; sessions: CompletedWorkoutSession[] }[] {
  const map = new Map<string, CompletedWorkoutSession[]>();
  for (const s of sessions) {
    const mk = monthKeyFromDayKey(s.dayKey);
    const list = map.get(mk) ?? [];
    list.push(s);
    map.set(mk, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, list]) => ({ monthKey, sessions: list }));
}
