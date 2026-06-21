import type { AppTheme } from "@newyouai/types";
import { useContext } from "react";
import { themeColors } from "@newyouai/config/tokens";

import { OnboardingWizardContext } from "@/context/OnboardingWizardContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { onboardingThemeFor } from "@/lib/onboardingTheme";

export function useOnboardingTheme() {
  const { scheme, colors, theme } = useAppTheme();
  const wizard = useContext(OnboardingWizardContext);
  const effectiveScheme = (wizard?.draftTheme ?? theme) as AppTheme;
  const effectiveColors = effectiveScheme === scheme ? colors : themeColors(effectiveScheme);
  const ob = onboardingThemeFor(effectiveScheme);
  return { scheme: effectiveScheme, colors: effectiveColors, ob };
}
