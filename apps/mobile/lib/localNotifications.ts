import type { AppState } from "@newyouai/types";
import {
  buildNutritionNotificationPayload,
  buildWorkoutNotificationPayload,
  hasNutritionLoggedForDateKey,
  isTrainingDay,
  localDateKey,
  normalizeTimeHHmm,
} from "@newyouai/core";

import { loadExpoNotificationsModule } from "@/lib/loadExpoNotificationsModule";

export const WORKOUT_NOTIFICATION_ID = "fitcoach-workout";
export const NUTRITION_NOTIFICATION_ID = "fitcoach-nutrition";

let handlerConfigured = false;

export async function initLocalNotifications(): Promise<void> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications || handlerConfigured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

export function parseReminderTime(hhmm: string): { hour: number; minute: number } | null {
  const normalized = normalizeTimeHHmm(hhmm, "00:00");
  const [hStr, mStr] = normalized.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return { hour, minute };
}

function isWorkoutScheduleEligible(state: AppState, permissionGranted: boolean, now: Date): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.workoutReminderEnabled || !permissionGranted) return false;

  const todayKey = localDateKey(now);
  if (state.workoutsCompletedByDay[todayKey]) return false;
  if (prefs.lastFiredWorkoutReminderDateKey === todayKey) return false;

  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  return isTrainingDay(now, state.workoutTemplates, daysPerWeek);
}

function isNutritionScheduleEligible(state: AppState, permissionGranted: boolean, now: Date): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.nutritionCheckInEnabled || !permissionGranted) return false;

  const todayKey = localDateKey(now);
  if (hasNutritionLoggedForDateKey(state, todayKey)) return false;
  if (prefs.lastFiredNutritionReminderDateKey === todayKey) return false;
  return true;
}

export async function cancelFitcoachNotification(id: string): Promise<void> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Unsupported environments (e.g. web), no-op
  }
}

export async function cancelAllFitcoachReminders(): Promise<void> {
  await cancelFitcoachNotification(WORKOUT_NOTIFICATION_ID);
  await cancelFitcoachNotification(NUTRITION_NOTIFICATION_ID);
}

export async function scheduleWorkoutReminder(state: AppState, permissionGranted: boolean): Promise<void> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications) return;

  await cancelFitcoachNotification(WORKOUT_NOTIFICATION_ID);

  const now = new Date();
  if (!isWorkoutScheduleEligible(state, permissionGranted, now)) return;

  const time = parseReminderTime(state.notificationPreferences.workoutReminderTime);
  if (!time) return;

  const payload = buildWorkoutNotificationPayload(state, now);
  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_NOTIFICATION_ID,
    content: {
      title: payload.title,
      body: payload.body,
      data: { tag: payload.tag },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

export async function scheduleNutritionReminder(state: AppState, permissionGranted: boolean): Promise<void> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications) return;

  await cancelFitcoachNotification(NUTRITION_NOTIFICATION_ID);

  const now = new Date();
  if (!isNutritionScheduleEligible(state, permissionGranted, now)) return;

  const time = parseReminderTime(state.notificationPreferences.nutritionCheckInTime);
  if (!time) return;

  const payload = buildNutritionNotificationPayload(state, now);
  await Notifications.scheduleNotificationAsync({
    identifier: NUTRITION_NOTIFICATION_ID,
    content: {
      title: payload.title,
      body: payload.body,
      data: { tag: payload.tag },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

export async function syncLocalNotifications(state: AppState, permissionGranted: boolean): Promise<void> {
  if (!permissionGranted) {
    await cancelAllFitcoachReminders();
    return;
  }

  await scheduleWorkoutReminder(state, permissionGranted);
  await scheduleNutritionReminder(state, permissionGranted);
}
