import type { NotificationPreferences } from "./types";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  workoutReminderEnabled: true,
  workoutReminderTime: "07:00",
  nutritionCheckInEnabled: true,
  nutritionCheckInTime: "20:00",
  morningCheckInEnabled: false,
  morningCheckInTime: "06:30",
  weeklyReviewEnabled: false,
  weeklyReviewTime: "08:00",
  lastFiredWorkoutReminderDateKey: null,
  lastFiredNutritionReminderDateKey: null,
};

/** Onboarding starts with reminders off. User opts in on the Stay on track step. */
export const ONBOARDING_NOTIFICATION_DEFAULTS: NotificationPreferences = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  workoutReminderEnabled: false,
  nutritionCheckInEnabled: false,
  morningCheckInEnabled: false,
  weeklyReviewEnabled: false,
};

export function anyNotificationEnabled(prefs: NotificationPreferences): boolean {
  return (
    prefs.workoutReminderEnabled ||
    prefs.nutritionCheckInEnabled ||
    prefs.morningCheckInEnabled ||
    prefs.weeklyReviewEnabled
  );
}

const HHMM_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function normalizeTimeHHmm(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!HHMM_RE.test(t)) return fallback;
  const [, h, m] = t.match(HHMM_RE) ?? [];
  return `${String(Number(h)).padStart(2, "0")}:${m}`;
}

function normalizeLastFiredDateKey(raw: unknown): string | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  return raw;
}

export function normalizeNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const o = raw as Record<string, unknown>;
  return {
    workoutReminderEnabled: o.workoutReminderEnabled !== false,
    workoutReminderTime: normalizeTimeHHmm(o.workoutReminderTime, DEFAULT_NOTIFICATION_PREFERENCES.workoutReminderTime),
    nutritionCheckInEnabled: o.nutritionCheckInEnabled !== false,
    nutritionCheckInTime: normalizeTimeHHmm(
      o.nutritionCheckInTime,
      DEFAULT_NOTIFICATION_PREFERENCES.nutritionCheckInTime,
    ),
    morningCheckInEnabled: o.morningCheckInEnabled === true,
    morningCheckInTime: normalizeTimeHHmm(
      o.morningCheckInTime,
      DEFAULT_NOTIFICATION_PREFERENCES.morningCheckInTime,
    ),
    weeklyReviewEnabled: o.weeklyReviewEnabled === true,
    weeklyReviewTime: normalizeTimeHHmm(o.weeklyReviewTime, DEFAULT_NOTIFICATION_PREFERENCES.weeklyReviewTime),
    lastFiredWorkoutReminderDateKey: normalizeLastFiredDateKey(o.lastFiredWorkoutReminderDateKey),
    lastFiredNutritionReminderDateKey: normalizeLastFiredDateKey(o.lastFiredNutritionReminderDateKey),
  };
}

function mergeLastFiredDateKey(local: string | null, remote: string | null): string | null {
  if (!local) return remote;
  if (!remote) return local;
  return local >= remote ? local : remote;
}

/** Prefer remote toggles/times; keep latest last-fired date keys to avoid duplicate notifications. */
export function mergeNotificationPreferences(
  local: NotificationPreferences,
  remote: NotificationPreferences,
): NotificationPreferences {
  const l = normalizeNotificationPreferences(local);
  const r = normalizeNotificationPreferences(remote);
  return {
    workoutReminderEnabled: r.workoutReminderEnabled,
    workoutReminderTime: r.workoutReminderTime,
    nutritionCheckInEnabled: r.nutritionCheckInEnabled,
    nutritionCheckInTime: r.nutritionCheckInTime,
    morningCheckInEnabled: r.morningCheckInEnabled,
    morningCheckInTime: r.morningCheckInTime,
    weeklyReviewEnabled: r.weeklyReviewEnabled,
    weeklyReviewTime: r.weeklyReviewTime,
    lastFiredWorkoutReminderDateKey: mergeLastFiredDateKey(
      l.lastFiredWorkoutReminderDateKey,
      r.lastFiredWorkoutReminderDateKey,
    ),
    lastFiredNutritionReminderDateKey: mergeLastFiredDateKey(
      l.lastFiredNutritionReminderDateKey,
      r.lastFiredNutritionReminderDateKey,
    ),
  };
}

/** Display HH:mm as locale time, e.g. 7:00 AM. */
export function formatNotificationTimeDisplay(hhmm: string): string {
  const normalized = normalizeTimeHHmm(hhmm, "07:00");
  const [hStr, mStr] = normalized.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return normalized;
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
