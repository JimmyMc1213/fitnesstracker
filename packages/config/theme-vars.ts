import {
  darkThemeColors,
  lightThemeColors,
  type AppTheme,
  type ThemeColorTokens,
} from "./tokens";

/** Space-separated RGB tuple for Tailwind `rgb(var(--x) / <alpha-value>)` usage. */
export function hexToRgbTuple(hex: string): string {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function cssVarsFromPalette(colors: ThemeColorTokens): Record<string, string> {
  return {
    "--color-background": hexToRgbTuple(colors.background),
    "--color-background-secondary": hexToRgbTuple(colors.backgroundSecondary),
    "--color-background-tertiary": hexToRgbTuple(colors.backgroundTertiary),
    "--color-foreground": hexToRgbTuple(colors.textPrimary),
    "--color-foreground-secondary": hexToRgbTuple(colors.textSecondary),
    "--color-foreground-tertiary": hexToRgbTuple(colors.textTertiary),
    "--color-border": hexToRgbTuple(colors.border),
    "--color-border-card": hexToRgbTuple(colors.cardBorder),
    "--color-card": hexToRgbTuple(colors.card),
    "--color-card-border": hexToRgbTuple(colors.cardBorder),
    "--color-accent": hexToRgbTuple(colors.accent),
    "--color-accent-foreground": hexToRgbTuple(colors.accentText),
    "--color-muted": hexToRgbTuple(colors.textSecondary),
  };
}

/** NativeWind `vars()` map for runtime light/dark token switching. */
export function themeCssVars(theme: AppTheme): Record<string, string> {
  return cssVarsFromPalette(theme === "light" ? lightThemeColors : darkThemeColors);
}
