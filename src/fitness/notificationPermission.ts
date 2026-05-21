export type NotificationPermissionState = NotificationPermission | "unsupported";

export function isNotificationSupported(): boolean {
  return typeof globalThis !== "undefined" && "Notification" in globalThis;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function permissionStatusLabel(permission: NotificationPermissionState): string {
  switch (permission) {
    case "granted":
      return "Notifications are enabled on this device.";
    case "denied":
      return "Notifications are blocked. Enable them in your browser or device settings to receive reminders.";
    case "default":
      return "Allow notifications when prompted so reminders can appear on this device.";
    default:
      return "Reminders are not supported in this browser. On iPhone, add Fitcoach to your Home Screen for the best experience.";
  }
}
