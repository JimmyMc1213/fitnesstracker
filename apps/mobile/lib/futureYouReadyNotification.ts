import { loadExpoNotificationsModule } from "@/lib/loadExpoNotificationsModule";

export const FUTURE_YOU_READY_NOTIFICATION_TITLE = "Your NewYou is ready";
export const FUTURE_YOU_READY_NOTIFICATION_BODY = "Tap to see your transformation.";

/**
 * Fire an immediate local notification when a Future You generation finishes
 * while the user is off the generating screen. No-ops if notifications are
 * unavailable or permission is not granted.
 */
export async function presentFutureYouReadyNotification(): Promise<void> {
  try {
    const Notifications = await loadExpoNotificationsModule();
    if (!Notifications) return;

    const settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: FUTURE_YOU_READY_NOTIFICATION_TITLE,
        body: FUTURE_YOU_READY_NOTIFICATION_BODY,
        data: { tag: "future-you-ready" },
      },
      trigger: null,
    });
  } catch {
    // Unsupported environment or denied permission — surfaced in-app instead.
  }
}
