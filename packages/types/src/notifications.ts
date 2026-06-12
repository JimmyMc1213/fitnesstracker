export type NotificationPreferences = {
  workoutReminderEnabled: boolean;
  workoutReminderTime: string;
  nutritionCheckInEnabled: boolean;
  nutritionCheckInTime: string;
  morningCheckInEnabled: boolean;
  morningCheckInTime: string;
  weeklyReviewEnabled: boolean;
  weeklyReviewTime: string;
  /** Last local date keys a reminder was shown, prevents duplicate fires per day */
  lastFiredWorkoutReminderDateKey: string | null;
  lastFiredNutritionReminderDateKey: string | null;
};
