import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeAppTheme } from "@newyouai/core";
import type { AppTheme } from "@newyouai/types";

/** Same key as PWA `theme.ts` for cross-platform draft parity */
export const GYMMY_THEME_KEY = "gymmy_theme";

export const DEFAULT_APP_THEME: AppTheme = "light";

export async function readStoredTheme(): Promise<AppTheme> {
  try {
    const raw = await AsyncStorage.getItem(GYMMY_THEME_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore
  }
  return DEFAULT_APP_THEME;
}

export async function writeStoredTheme(theme: AppTheme): Promise<void> {
  const normalized = normalizeAppTheme(theme);
  await AsyncStorage.setItem(GYMMY_THEME_KEY, normalized);
}
