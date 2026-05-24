import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  applyThemeToDocument,
  darkTheme,
  normalizeAppTheme,
  readStoredTheme,
  themeColors,
  writeStoredTheme,
  type AppTheme,
} from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  colors: typeof darkTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  persistedTheme,
  onPersistTheme,
}: {
  children: ReactNode;
  persistedTheme?: AppTheme | null;
  onPersistTheme?: (theme: AppTheme) => void;
}) {
  const [theme, setThemeState] = useState<AppTheme>(() => readStoredTheme());

  useEffect(() => {
    if (persistedTheme == null) return;
    const next = normalizeAppTheme(persistedTheme);
    setThemeState(next);
    applyThemeToDocument(next);
    writeStoredTheme(next);
  }, [persistedTheme]);

  const setTheme = useCallback(
    (next: AppTheme) => {
      const normalized = normalizeAppTheme(next);
      setThemeState(normalized);
      applyThemeToDocument(normalized);
      writeStoredTheme(normalized);
      onPersistTheme?.(normalized);
    },
    [onPersistTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: themeColors(theme),
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
