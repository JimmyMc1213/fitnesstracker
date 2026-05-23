import type { Dispatch, SetStateAction } from "react";
import { buildCoachContext, getNotificationBody } from "./coachEngine";
import { localDateKey } from "./dailyPlan";
import { getNotificationPermission } from "./notificationPermission";
import { normalizeTimeHHmm } from "./notificationPreferences";
import { showFitcoachNotification, type FitcoachNotificationTag } from "./registerNotificationServiceWorker";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import type {
  AppState,
  NotificationPreferences,
  WorkoutDaysPerWeek,
  WorkoutRoutineTemplate,
} from "./types";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEFAULT_TRAINING_DAYS: Record<WorkoutDaysPerWeek, readonly string[]> = {
  3: ["Mon", "Tue", "Thu"],
  4: ["Mon", "Tue", "Wed", "Thu"],
  5: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  6: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const NOTIFICATION_ICON = "/favicon.svg";

export type NotificationPayload = {
  title: string;
  body: string;
  tag: FitcoachNotificationTag;
  icon: string;
};

function weekdayShort(d: Date): string {
  return WEEKDAY_SHORT[d.getDay()] ?? "Sun";
}

function normalizeDayLabel(label: string): string | null {
  const t = label.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  if (lower.startsWith("sun")) return "Sun";
  if (lower.startsWith("mon")) return "Mon";
  if (lower.startsWith("tue")) return "Tue";
  if (lower.startsWith("wed")) return "Wed";
  if (lower.startsWith("thu")) return "Thu";
  if (lower.startsWith("fri")) return "Fri";
  if (lower.startsWith("sat")) return "Sat";
  if (t.length >= 3) return t.slice(0, 3);
  return null;
}

function trainingDaysFromTemplates(templates: WorkoutRoutineTemplate[]): Set<string> | null {
  const labels = templates
    .map((t) => normalizeDayLabel(t.dayLabel))
    .filter((x): x is string => x != null);
  if (labels.length === 0) return null;
  return new Set(labels);
}

export function isTrainingDay(
  date: Date,
  templates: WorkoutRoutineTemplate[],
  daysPerWeek: WorkoutDaysPerWeek,
): boolean {
  const today = weekdayShort(date);
  const fromTemplates = trainingDaysFromTemplates(templates);
  if (fromTemplates) return fromTemplates.has(today);
  return DEFAULT_TRAINING_DAYS[daysPerWeek].includes(today);
}

function isAtOrPastHHmm(now: Date, hhmm: string): boolean {
  const normalized = normalizeTimeHHmm(hhmm, "00:00");
  const [hStr, mStr] = normalized.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const targetMins = hour * 60 + minute;
  return nowMins >= targetMins;
}

function hasNutritionLoggedForDateKey(state: AppState, dateKey: string): boolean {
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

function notificationPermissionGranted(): boolean {
  return getNotificationPermission() === "granted";
}

export function shouldFireWorkoutReminder(now: Date, state: AppState): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.workoutReminderEnabled || !notificationPermissionGranted()) return false;

  const todayKey = localDateKey(now);
  if (state.workoutsCompletedByDay[todayKey]) return false;
  if (prefs.lastFiredWorkoutReminderDateKey === todayKey) return false;
  if (!isAtOrPastHHmm(now, prefs.workoutReminderTime)) return false;

  const daysPerWeek = state.onboardingProfile?.workoutDaysPerWeek ?? 5;
  return isTrainingDay(now, state.workoutTemplates, daysPerWeek);
}

export function shouldFireNutritionReminder(now: Date, state: AppState): boolean {
  const prefs = state.notificationPreferences;
  if (!prefs.nutritionCheckInEnabled || !notificationPermissionGranted()) return false;

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
    icon: NOTIFICATION_ICON,
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
    icon: NOTIFICATION_ICON,
  };
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
  const todayKey = localDateKey(now);
  let workoutFired = false;
  let nutritionFired = false;

  if (shouldFireWorkoutReminder(now, state)) {
    const payload = buildWorkoutNotificationPayload(state);
    try {
      await showFitcoachNotification(payload.title, payload.body, payload.tag);
      workoutFired = true;
    } catch (err) {
      console.warn("[Fitcoach] Workout reminder failed:", err);
    }
  }

  if (shouldFireNutritionReminder(now, state)) {
    const payload = buildNutritionNotificationPayload(state);
    try {
      await showFitcoachNotification(payload.title, payload.body, payload.tag);
      nutritionFired = true;
    } catch (err) {
      console.warn("[Fitcoach] Nutrition reminder failed:", err);
    }
  }

  if (!workoutFired && !nutritionFired) return;

  setState((prev) => ({
    ...prev,
    notificationPreferences: patchLastFired(prev.notificationPreferences, {
      ...(workoutFired ? { lastFiredWorkoutReminderDateKey: todayKey } : {}),
      ...(nutritionFired ? { lastFiredNutritionReminderDateKey: todayKey } : {}),
    }),
  }));
}
