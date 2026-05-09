import { loadTasksForToday } from "./dailyPlan";
import type { AppState } from "./types";

/** Refresh daily checklist copy when nutrition targets change (e.g. after Sunday approval). */
export function refreshDailyTasksForTargets(s: AppState): AppState {
  return { ...s, dailyTasks: loadTasksForToday(s.nutritionTargets, s.planStartIso, s.stepsTarget) };
}
