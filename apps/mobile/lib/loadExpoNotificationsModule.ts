import { isExpoNotificationsAvailable } from "@/lib/expoNativeModules";

type NotificationsModule = typeof import("expo-notifications");

let cached: NotificationsModule | null | undefined;

/** Lazy-load expo-notifications only when the native module is linked in this dev client. */
export async function loadExpoNotificationsModule(): Promise<NotificationsModule | null> {
  if (cached !== undefined) return cached;
  if (!isExpoNotificationsAvailable()) {
    cached = null;
    return null;
  }
  try {
    cached = await import("expo-notifications");
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
