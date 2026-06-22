import { Stack } from "expo-router";
import { useEffect } from "react";

import { OnboardingWizardProvider } from "@/context/OnboardingWizardContext";
import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { configureRevenueCat } from "@/lib/revenueCat";
import { defaultStackScreenOptions } from "@/lib/navigationMotion";

export default function OnboardingLayout() {
  useEffect(() => {
    void configureRevenueCat();
  }, []);

  return (
    <RequireSignedInSession>
      <OnboardingWizardProvider>
        <Stack screenOptions={defaultStackScreenOptions} />
      </OnboardingWizardProvider>
    </RequireSignedInSession>
  );
}
