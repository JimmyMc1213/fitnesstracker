import { themeColors } from "@newyouai/config/tokens";

import { useColorScheme } from "@/components/useColorScheme";

export function useAppTheme() {
  const scheme = useColorScheme();
  return {
    scheme,
    colors: themeColors(scheme),
  };
}
