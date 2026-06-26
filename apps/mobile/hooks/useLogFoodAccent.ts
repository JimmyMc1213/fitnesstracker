import { useAppTheme } from "@/hooks/useAppTheme";
import { logFoodAccentColors } from "@/lib/nutritionUiTokens";

export function useLogFoodAccent() {
  const { scheme, colors } = useAppTheme();
  return { colors, ...logFoodAccentColors(scheme) };
}
