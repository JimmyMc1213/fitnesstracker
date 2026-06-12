import { normalizeAppTheme } from "@newyouai/core";
import type { AppTheme } from "@newyouai/types";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";

import { readStoredTheme, writeStoredTheme } from "@/lib/themeStorage";
import { themeColors } from "@newyouai/config/tokens";

export function useThemePreference() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const scheme = colorScheme === "light" ? "light" : "dark";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await readStoredTheme();
      if (cancelled) return;
      setColorScheme(stored);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setColorScheme]);

  const setTheme = useCallback(
    (next: AppTheme) => {
      const normalized = normalizeAppTheme(next);
      setColorScheme(normalized);
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
