import { useThemePreference } from "@/hooks/useThemePreference";

export function useAppTheme() {
  const { scheme, colors, theme, setTheme } = useThemePreference();
  return {
    scheme,
    colors,
    theme,
    setTheme,
  };
}
