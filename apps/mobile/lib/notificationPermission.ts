import { loadExpoNotificationsModule } from "@/lib/loadExpoNotificationsModule";

export type NotificationPermissionState = "granted" | "denied" | "undetermined" | "unsupported";

type ExpoPermissionStatus = "granted" | "denied" | "undetermined";

function mapPermissionStatus(status: ExpoPermissionStatus): NotificationPermissionState {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  if (status === "undetermined") return "undetermined";
  return "unsupported";
}

export async function getNotificationPermission(): Promise<NotificationPermissionState> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications) return "unsupported";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return mapPermissionStatus(status);
  } catch {
    return "unsupported";
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  const Notifications = await loadExpoNotificationsModule();
  if (!Notifications) return "unsupported";
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return mapPermissionStatus(status);
  } catch {
    return "unsupported";
  }
}

export function permissionStatusLabel(permission: NotificationPermissionState): string {
  switch (permission) {
    case "granted":
      return "Notifications are enabled on this device.";
    case "denied":
      return "Notifications are blocked. Enable them in Settings to receive reminders.";
    case "undetermined":
      return "Allow notifications when prompted so reminders can appear on this device.";
    default:
      return "Reminders are not supported on this device.";
  }
}
