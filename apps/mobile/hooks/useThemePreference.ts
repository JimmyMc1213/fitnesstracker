import { normalizeAppTheme } from "@newyouai/core";
import type { AppTheme } from "@newyouai/types";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { readStoredTheme, writeStoredTheme } from "@/lib/themeStorage";
import { isVisualParityMode } from "@/lib/visualParity";
import { themeColors } from "@newyouai/config/tokens";

function applyWebColorScheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useThemePreference() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [webTheme, setWebTheme] = useState<AppTheme>("light");
  const nativeScheme = colorScheme === "light" ? "light" : "dark";
  const scheme = Platform.OS === "web" ? webTheme : nativeScheme;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = isVisualParityMode() ? "dark" : await readStoredTheme();
      if (cancelled) return;
      if (Platform.OS === "web") {
        setWebTheme(stored);
        applyWebColorScheme(stored);
      } else {
        setColorScheme(stored);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setColorScheme]);

  const setTheme = useCallback(
    (next: AppTheme) => {
      const normalized = normalizeAppTheme(next);
      if (Platform.OS === "web") {
        setWebTheme(normalized);
        applyWebColorScheme(normalized);
      } else {
        setColorScheme(normalized);
      }
      void writeStoredTheme(normalized);
    },
    [setColorScheme],
  );

  return {
    theme: scheme as AppTheme,
    scheme,
    colors: themeColors(scheme),
    setTheme,
    hydrated,
  };
}
