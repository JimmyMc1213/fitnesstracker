import { localDateKey } from "./dailyPlan";
import { nutritionGoalHitForDateKey } from "./dailyStreak";
import type { AppState, CompletedWorkoutSession } from "./types";

export type WeeklySummary = {
  weekStartKey: string;
  weekEndKey: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  totalVolumeLbs: number;
  nutritionDaysHit: number;
  daysInWeek: number;
};

function parseDateKeyNoonLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Monday (local) containing the given date key. */
export function startOfWeekMonday(dateKey: string): string {
  const d = parseDateKeyNoonLocal(dateKey);
  const dow = d.getDay();
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - daysFromMonday);
  return localDateKey(d);
}

function dateKeyPlusDays(dateKey: string, days: number): string {
  const d = parseDateKeyNoonLocal(dateKey);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

/** Mon–Sun date keys for the week containing `anchorDateKey`. */
export function weekDateKeysMondayStart(anchorDateKey: string): string[] {
  const start = startOfWeekMonday(anchorDateKey);
  return Array.from({ length: 7 }, (_, i) => dateKeyPlusDays(start, i));
}

function sessionVolumeLbs(session: CompletedWorkoutSession): number {
  return session.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((sum, st) => sum + st.w * st.r, 0),
    0,
  );
}

function isDateKeyInRange(dateKey: string, startKey: string, endKey: string): boolean {
  return dateKey >= startKey && dateKey <= endKey;
}

/** Aggregate workout + nutrition stats for the Mon–Sun week containing `todayKey`. */
export function buildWeeklySummary(state: AppState, todayKey: string): WeeklySummary {
  const weekStartKey = startOfWeekMonday(todayKey);
  const weekEndKey = dateKeyPlusDays(weekStartKey, 6);
  const weekKeys = weekDateKeysMondayStart(todayKey);

  const completedDays = new Set<string>();
  let totalVolumeLbs = 0;

  for (const session of state.workoutHistory ?? []) {
    if (!isDateKeyInRange(session.dayKey, weekStartKey, weekEndKey)) continue;
    completedDays.add(session.dayKey);
    totalVolumeLbs += sessionVolumeLbs(session);
  }

  let nutritionDaysHit = 0;
  for (const dayKey of weekKeys) {
    if (
      nutritionGoalHitForDateKey(
        state.nutritionManualByDay,
        state.nutritionItemsByDay,
        state.nutritionTargets,
        dayKey,
      )
    ) {
      nutritionDaysHit += 1;
    }
  }

  const workoutsPlanned = state.onboardingProfile?.workoutDaysPerWeek ?? 5;

  return {
    weekStartKey,
    weekEndKey,
    workoutsCompleted: completedDays.size,
    workoutsPlanned,
    totalVolumeLbs,
    nutritionDaysHit,
    daysInWeek: 7,
  };
}

export function formatWeeklySummaryRange(weekStartKey: string, weekEndKey: string): string {
  const start = parseDateKeyNoonLocal(weekStartKey);
  const end = parseDateKeyNoonLocal(weekEndKey);
  const sameMonth = start.getMonth() === end.getMonth();
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}
