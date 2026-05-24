import { loadTasksForToday } from "./dailyPlan";
import { resolveWorkoutDaysPerWeek } from "./trainingCalendar";
import type { AppState } from "./types";

/** Refresh daily checklist copy when nutrition targets change (e.g. after Sunday approval). */
export function refreshDailyTasksForTargets(s: AppState): AppState {
  const daysPerWeek = resolveWorkoutDaysPerWeek(s.workoutTemplates, s.onboardingProfile?.workoutDaysPerWeek);
  return {
    ...s,
    dailyTasks: loadTasksForToday(s.nutritionTargets, s.planStartIso, s.stepsTarget, s.workoutTemplates, daysPerWeek),
  };
}
