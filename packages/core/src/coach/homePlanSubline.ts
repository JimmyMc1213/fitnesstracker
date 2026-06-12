import { planWeekIndex } from "../plan/planWeekIndex";
import type { AppState } from "@newyouai/types";

/** Plan-aware subline under the home greeting (null = omit). */
export function homePlanSubline(state: AppState, date: Date = new Date()): string | null {
  const days = state.onboardingProfile?.workoutDaysPerWeek;
  if (days == null) return null;

  const week = planWeekIndex(date, state.planStartIso);
  return `Week ${week} of your ${days}-day split`;
}
