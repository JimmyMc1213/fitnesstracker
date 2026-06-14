import { requireOptionalNativeModule } from "expo-modules-core";

function hasNativeModule(name: string): boolean {
  try {
    return requireOptionalNativeModule(name) != null;
  } catch {
    return false;
  }
}

/** Dev client includes expo-camera (false on older builds). */
export function isExpoCameraAvailable(): boolean {
  return hasNativeModule("ExpoCamera");
}

/** Dev client includes expo-notifications (false on older builds / web). */
export function isExpoNotificationsAvailable(): boolean {
  return hasNativeModule("ExpoNotifications");
}
