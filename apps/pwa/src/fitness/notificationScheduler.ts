import type { Dispatch, SetStateAction } from "react";
import {
  buildNutritionNotificationPayload as coreBuildNutritionNotificationPayload,
  buildWorkoutNotificationPayload as coreBuildWorkoutNotificationPayload,
  computeNotificationPatches,
  shouldFireNutritionReminder as coreShouldFireNutritionReminder,
  shouldFireWorkoutReminder as coreShouldFireWorkoutReminder,
  type NotificationPayload as CoreNotificationPayload,
} from "@newyouai/core";
import { getNotificationPermission } from "./notificationPermission";
import { showFitcoachNotification } from "./registerNotificationServiceWorker";
import type { AppState, NotificationPreferences } from "./types";

export { isTrainingDay } from "@newyouai/core";

const NOTIFICATION_ICON = "/favicon.png";

export type NotificationPayload = CoreNotificationPayload & { icon: string };

function withWebIcon(payload: CoreNotificationPayload): NotificationPayload {
  return { ...payload, icon: NOTIFICATION_ICON };
}

export function shouldFireWorkoutReminder(now: Date, state: AppState): boolean {
  return coreShouldFireWorkoutReminder(now, state, getNotificationPermission() === "granted");
}

export function shouldFireNutritionReminder(now: Date, state: AppState): boolean {
  return coreShouldFireNutritionReminder(now, state, getNotificationPermission() === "granted");
}

export function buildWorkoutNotificationPayload(state: AppState, now: Date = new Date()): NotificationPayload {
  return withWebIcon(coreBuildWorkoutNotificationPayload(state, now));
}

export function buildNutritionNotificationPayload(state: AppState, now: Date = new Date()): NotificationPayload {
  return withWebIcon(coreBuildNutritionNotificationPayload(state, now));
}

function patchLastFired(
  prefs: NotificationPreferences,
  patch: Partial<Pick<NotificationPreferences, "lastFiredWorkoutReminderDateKey" | "lastFiredNutritionReminderDateKey">>,
): NotificationPreferences {
  return { ...prefs, ...patch };
}

export async function checkAndFireDueNotifications(
  state: AppState,
  setState: Dispatch<SetStateAction<AppState>>,
): Promise<void> {
  const now = new Date();
  const permissionGranted = getNotificationPermission() === "granted";
  const patches = computeNotificationPatches(state, now, permissionGranted);

  let workoutFired = false;
  let nutritionFired = false;
  const prefsPatch: Partial<
    Pick<NotificationPreferences, "lastFiredWorkoutReminderDateKey" | "lastFiredNutritionReminderDateKey">
  > = {};

  if (patches.workoutPayload) {
    const payload = withWebIcon(patches.workoutPayload);
    try {
      await showFitcoachNotification(payload.title, payload.body, payload.tag);
      workoutFired = true;
      if (patches.notificationPreferences?.lastFiredWorkoutReminderDateKey) {
        prefsPatch.lastFiredWorkoutReminderDateKey =
          patches.notificationPreferences.lastFiredWorkoutReminderDateKey;
      }
    } catch (err) {
      console.warn("[Fitcoach] Workout reminder failed:", err);
    }
  }

  if (patches.nutritionPayload) {
    const payload = withWebIcon(patches.nutritionPayload);
    try {
      await showFitcoachNotification(payload.title, payload.body, payload.tag);
      nutritionFired = true;
      if (patches.notificationPreferences?.lastFiredNutritionReminderDateKey) {
        prefsPatch.lastFiredNutritionReminderDateKey =
          patches.notificationPreferences.lastFiredNutritionReminderDateKey;
      }
    } catch (err) {
      console.warn("[Fitcoach] Nutrition reminder failed:", err);
    }
  }

  if (!workoutFired && !nutritionFired) return;

  setState((prev) => ({
    ...prev,
    notificationPreferences: patchLastFired(prev.notificationPreferences, prefsPatch),
  }));
}
