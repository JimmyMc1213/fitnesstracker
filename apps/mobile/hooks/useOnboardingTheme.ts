import { useAppTheme } from "@/hooks/useAppTheme";
import { onboardingThemeFor } from "@/lib/onboardingTheme";

export function useOnboardingTheme() {
  const { scheme, colors } = useAppTheme();
  const ob = onboardingThemeFor(scheme);
  return { scheme, colors, ob };
}
