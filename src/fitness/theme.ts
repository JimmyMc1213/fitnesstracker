export type AppTheme = "dark" | "light";

export const GYMMY_THEME_KEY = "gymmy_theme";

export const darkTheme = {
  background: "#0a0a0a",
  backgroundSecondary: "#161616",
  backgroundTertiary: "#1a1a1a",
  border: "#2a2a2a",
  textPrimary: "#ffffff",
  textSecondary: "#888888",
  textTertiary: "#555555",
  accent: "#3B82F6",
  accentText: "#ffffff",
  card: "#161616",
  cardBorder: "#2a2a2a",
};

export const lightTheme = {
  background: "#ffffff",
  backgroundSecondary: "#f5f5f5",
  backgroundTertiary: "#ebebeb",
  border: "#e0e0e0",
  textPrimary: "#0a0a0a",
  textSecondary: "#555555",
  textTertiary: "#888888",
  accent: "#3B82F6",
  accentText: "#ffffff",
  card: "#ffffff",
  cardBorder: "#e0e0e0",
};

export function themeColors(theme: AppTheme) {
  return theme === "light" ? lightTheme : darkTheme;
}

export function normalizeAppTheme(raw: unknown): AppTheme {
  return raw === "light" ? "light" : "dark";
}

export const DEFAULT_APP_THEME: AppTheme = "light";

export function readStoredTheme(): AppTheme {
  if (typeof localStorage === "undefined") return DEFAULT_APP_THEME;
  try {
    const raw = localStorage.getItem(GYMMY_THEME_KEY);
    if (raw == null) return DEFAULT_APP_THEME;
    return normalizeAppTheme(raw);
  } catch {
    return DEFAULT_APP_THEME;
  }
}

const THEME_TRANSITION_MS = 380;
let themeTransitionTimer: ReturnType<typeof setTimeout> | null = null;

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (themeTransitionTimer != null) {
    clearTimeout(themeTransitionTimer);
  }
  const previous = root.getAttribute("data-theme");
  const shouldAnimate = previous != null && previous !== theme;
  if (shouldAnimate) {
    root.classList.add("theme-transition");
  }
  root.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "light" ? lightTheme.background : darkTheme.background);
  }
  if (!shouldAnimate) return;
  themeTransitionTimer = setTimeout(() => {
    root.classList.remove("theme-transition");
    themeTransitionTimer = null;
  }, THEME_TRANSITION_MS);
}

export function writeStoredTheme(theme: AppTheme): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(GYMMY_THEME_KEY, theme);
  } catch {
    /* quota */
  }
}
