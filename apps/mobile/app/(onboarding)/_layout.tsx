import { Stack } from "expo-router";
import { useEffect } from "react";

import { OnboardingWizardProvider } from "@/context/OnboardingWizardContext";
import { configureRevenueCat } from "@/lib/revenueCat";
import { defaultStackScreenOptions } from "@/lib/navigationMotion";

export default function OnboardingLayout() {
  useEffect(() => {
    void configureRevenueCat();
  }, []);

  return (
    <OnboardingWizardProvider>
      <Stack screenOptions={defaultStackScreenOptions} />
    </OnboardingWizardProvider>
  );
}
