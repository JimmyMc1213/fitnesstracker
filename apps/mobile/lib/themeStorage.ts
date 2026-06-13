import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeAppTheme } from "@newyouai/core";
import type { AppTheme } from "@newyouai/types";

export const THEME_STORAGE_KEY = "newyou_theme";
const LEGACY_THEME_KEY = "gymmy_theme";

export const DEFAULT_APP_THEME: AppTheme = "light";

async function readThemeRaw(): Promise<string | null> {
  const current = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  if (current) return current;

  const legacy = await AsyncStorage.getItem(LEGACY_THEME_KEY);
  if (!legacy) return null;

  await AsyncStorage.setItem(THEME_STORAGE_KEY, legacy);
  await AsyncStorage.removeItem(LEGACY_THEME_KEY);
  return legacy;
}

export async function readStoredTheme(): Promise<AppTheme> {
  try {
    const raw = await readThemeRaw();
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    // ignore
  }
  return DEFAULT_APP_THEME;
}

export async function writeStoredTheme(theme: AppTheme): Promise<void> {
  const normalized = normalizeAppTheme(theme);
  await AsyncStorage.setItem(THEME_STORAGE_KEY, normalized);
  await AsyncStorage.removeItem(LEGACY_THEME_KEY);
}
