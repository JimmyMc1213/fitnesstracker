import type { AppState, NotificationPreferences } from "@newyouai/types";

import { buildCoachContext, getNotificationBody } from "../coach/coachEngine";
import { localDateKey } from "../dates/dailyPlan";
import { effectiveNutritionTotalsForDateKey } from "../nutrition/nutritionTotals";
import { normalizeTimeHHmm } from "../sync/notificationPreferences";
import { isTrainingDay } from "../training/trainingCalendar";

export { isTrainingDay } from "../training/trainingCalendar";

export type FitcoachNotificationTag = "fitcoach-workout" | "fitcoach-nutrition";

export type NotificationPayload = {
  title: string;
  body: string;
  tag: FitcoachNotificationTag;
  icon?: string;
};

export type NotificationPatchResult = {
  workoutPayload?: NotificationPayload;
  nutritionPayload?: NotificationPayload;
  notificationPreferences?: Partial<
    Pick<NotificationPreferences, "lastFiredWorkoutReminderDateKey" | "lastFiredNutritionReminderDateKey">
  >;
};

export function isAtOrPastHHmm(now: Date, hhmm: string): boolean {
  const normalized = normalizeTimeHHmm(hhmm, "00:00");
  const [hStr, mStr] = normalized.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const targetMins = hour * 60 + minute;
  return nowMins >= targetMins;
}

export function hasNutritionLoggedForDateKey(state: AppState, dateKey: string): boolean {
  const items = state.nutritionItemsByDay[dateKey];
  if (items && items.length > 0) return true;
  if (dateKey in state.nutritionManualByDay) return true;
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    dateKey,
  );
  return totals.cal > 0 || totals.p > 0 || totals.c > 0 || totals.f > 0;
}

export function shouldFireWorkoutReminder(
  now: Date,
  state: AppState,
  permissionGranted: boolean,
): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.workoutReminderEnabled || !permissionGranted) return false;

  const todayKey = localDateKey(now);
  if (state.workoutsCompletedByDay[todayKey]) return false;
  if (prefs.lastFiredWorkoutReminderDateKey === todayKey) return false;
  if (!isAtOrPastHHmm(now, prefs.workoutReminderTime)) return false;

  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  return isTrainingDay(now, state.workoutTemplates, daysPerWeek);
}

export function shouldFireNutritionReminder(
  now: Date,
  state: AppState,
  permissionGranted: boolean,
): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.nutritionCheckInEnabled || !permissionGranted) return false;

  const todayKey = localDateKey(now);
  if (hasNutritionLoggedForDateKey(state, todayKey)) return false;
  if (prefs.lastFiredNutritionReminderDateKey === todayKey) return false;
  return isAtOrPastHHmm(now, prefs.nutritionCheckInTime);
}

export function buildWorkoutNotificationPayload(state: AppState, now: Date = new Date()): NotificationPayload {
  const title = "Workout day";
  const todayKey = localDateKey(now);
  const ctx = buildCoachContext(state, todayKey, now);
  const body = getNotificationBody(ctx, "workout");
  return {
    title,
    body,
    tag: "fitcoach-workout",
  };
}

export function buildNutritionNotificationPayload(state: AppState, now: Date = new Date()): NotificationPayload {
  const todayKey = localDateKey(now);
  const ctx = buildCoachContext(state, todayKey, now);
  const body = getNotificationBody(ctx, "nutrition");
  return {
    title: "Nutrition check-in",
    body,
    tag: "fitcoach-nutrition",
  };
}

export function computeNotificationPatches(
  state: AppState,
  now: Date,
  permissionGranted: boolean,
): NotificationPatchResult {
  const todayKey = localDateKey(now);
  const result: NotificationPatchResult = {};

  if (shouldFireWorkoutReminder(now, state, permissionGranted)) {
    result.workoutPayload = buildWorkoutNotificationPayload(state, now);
    result.notificationPreferences = {
      ...result.notificationPreferences,
      lastFiredWorkoutReminderDateKey: todayKey,
    };
  }

  if (shouldFireNutritionReminder(now, state, permissionGranted)) {
    result.nutritionPayload = buildNutritionNotificationPayload(state, now);
    result.notificationPreferences = {
      ...result.notificationPreferences,
      lastFiredNutritionReminderDateKey: todayKey,
    };
  }

  return result;
}
