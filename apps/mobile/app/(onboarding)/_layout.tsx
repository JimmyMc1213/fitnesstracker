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
        {/* Onboarding drives its own back button and internal slide transitions;
            the native iOS swipe-back must stay off or a drag (e.g. on the reminder
            time wheel) can pop/slide the whole route and leave it stuck off-screen. */}
        <Stack screenOptions={{ ...defaultStackScreenOptions, gestureEnabled: false }} />
      </OnboardingWizardProvider>
    </RequireSignedInSession>
  );
}
