import { DEFAULT_NOTIFICATION_PREFERENCES } from "@newyouai/core";
import type { NotificationPreferences } from "@newyouai/types";

export { DEFAULT_NOTIFICATION_PREFERENCES };

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
