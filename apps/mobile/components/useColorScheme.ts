import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export type ColorScheme = "light" | "dark";

/** System-aware scheme for navigation chrome and legacy Colors map. */
export function useColorScheme(): ColorScheme {
  const { colorScheme } = useNativeWindColorScheme();
  return colorScheme === "light" ? "light" : "dark";
}
