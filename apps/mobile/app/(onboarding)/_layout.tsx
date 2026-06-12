import { Stack } from "expo-router";
import { useEffect } from "react";

import { OnboardingWizardProvider } from "@/context/OnboardingWizardContext";
import { configureRevenueCat } from "@/lib/revenueCat";

export default function OnboardingLayout() {
  useEffect(() => {
    void configureRevenueCat();
  }, []);

  return (
    <OnboardingWizardProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingWizardProvider>
  );
}
