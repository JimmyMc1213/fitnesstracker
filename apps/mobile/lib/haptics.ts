import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

// iOS-only: the subtle Taptic Engine feel does not translate reliably on Android
// actuators, so we gate every call. All helpers are fire-and-forget — a rejected
// promise is swallowed so a failed haptic can never throw into a render path.

const isIOS = Platform.OS === "ios";

function run(fn: () => Promise<void>): void {
  if (!isIOS) return;
  void fn().catch(() => {});
}

/** Crisp selection "tick" — default feel for taps, toggles, keypad digits, tab switches. */
export function hapticSelection(): void {
  run(() => Haptics.selectionAsync());
}

/** Gentle soft impact — routine confirmations (e.g. completing a set, logging food). */
export function hapticSoft(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}

/** Light impact — one step above selection for meaningful taps without feeling heavy. */
export function hapticLight(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Success notification — reserved for big moments only (full workout finish, PR hits). */
export function hapticSuccess(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Error notification — invalid actions (e.g. rejected set completion). */
export function hapticError(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
