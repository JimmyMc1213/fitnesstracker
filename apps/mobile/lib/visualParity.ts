import { Platform } from "react-native";

export function isVisualParityMode(): boolean {
  if (typeof __DEV__ === "undefined" || !__DEV__) return false;
  return process.env.EXPO_PUBLIC_VISUAL_PARITY?.trim().toLowerCase() === "true";
}

/** Side-by-side browser pass uses RN Web; constrain layout to iPhone width. */
export function isVisualParityWebFrame(): boolean {
  return isVisualParityMode() && Platform.OS === "web";
}
