import { DEFAULT_NOTIFICATION_PREFERENCES, normalizeTimeHHmm } from "@newyouai/core";
import type { NotificationPreferences } from "@newyouai/types";

export { DEFAULT_NOTIFICATION_PREFERENCES };

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
