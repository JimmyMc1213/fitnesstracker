/**
 * Brand design tokens derived from apps/pwa/src/fitness/theme.ts.
 * Shared by NativeWind (mobile) and Tailwind preset (web/admin).
 */

export type AppTheme = "dark" | "light";

export const darkThemeColors = {
  background: "#0a0a0a",
  backgroundSecondary: "#161616",
  backgroundTertiary: "#1a1a1a",
  border: "#2a2a2a",
  textPrimary: "#ffffff",
  textSecondary: "#888888",
  textTertiary: "#555555",
  accent: "#3B82F6",
  accentText: "#ffffff",
  buttonPrimary: "#ffffff",
  buttonPrimaryText: "#0a0a0a",
  card: "#161616",
  cardBorder: "#2a2a2a",
} as const;

export const lightThemeColors = {
  background: "#ffffff",
  backgroundSecondary: "#f5f5f5",
  backgroundTertiary: "#ebebeb",
  border: "#e0e0e0",
  textPrimary: "#0a0a0a",
  textSecondary: "#555555",
  textTertiary: "#888888",
  accent: "#3B82F6",
  accentText: "#ffffff",
  buttonPrimary: "#0a0a0a",
  buttonPrimaryText: "#ffffff",
  card: "#ffffff",
  cardBorder: "#e0e0e0",
} as const;

export type ThemeColorTokens = typeof darkThemeColors | typeof lightThemeColors;

export function themeColors(theme: AppTheme): ThemeColorTokens {
  return theme === "light" ? lightThemeColors : darkThemeColors;
}

/** Default Tailwind color map (dark theme — matches PWA shell). */
export const tailwindColors = {
  background: {
    DEFAULT: darkThemeColors.background,
    secondary: darkThemeColors.backgroundSecondary,
    tertiary: darkThemeColors.backgroundTertiary,
  },
  foreground: {
    DEFAULT: darkThemeColors.textPrimary,
    secondary: darkThemeColors.textSecondary,
    tertiary: darkThemeColors.textTertiary,
  },
  border: {
    DEFAULT: darkThemeColors.border,
    card: darkThemeColors.cardBorder,
  },
  card: {
    DEFAULT: darkThemeColors.card,
    border: darkThemeColors.cardBorder,
  },
  accent: {
    DEFAULT: darkThemeColors.accent,
    foreground: darkThemeColors.accentText,
  },
  muted: darkThemeColors.textSecondary,
} as const;

export const spacing = {
  screenX: 24,
  cardPadding: 16,
  sectionGap: 12,
} as const;

export const borderRadius = {
  card: 12,
  pill: 9999,
  button: 12,
} as const;
