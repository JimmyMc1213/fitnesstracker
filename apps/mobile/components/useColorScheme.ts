import { useThemePreference } from "@/hooks/useThemePreference";

export type ColorScheme = "light" | "dark";

/** Scheme for navigation chrome, matches persisted / visual-parity theme on web. */
export function useColorScheme(): ColorScheme {
  const { scheme } = useThemePreference();
  return scheme;
}
