import { useState } from "react";

import { AuthScreen } from "./AuthScreen";
import { OnboardingWelcomeScreen } from "./OnboardingWelcomeScreen";

type AuthEntryView = "welcome" | "signup" | "signin";

type AuthEntryFlowProps = {
  externalError?: string | null;
  onSignInSuccess?: () => void;
};

export function AuthEntryFlow({ externalError, onSignInSuccess }: AuthEntryFlowProps) {
  const [view, setView] = useState<AuthEntryView>("welcome");

  if (view === "welcome") {
    return (
      <OnboardingWelcomeScreen
        signInPrompt="existing-account"
        onGetStarted={() => setView("signup")}
        onSignIn={() => setView("signin")}
      />
    );
  }

  return (
    <AuthScreen
      initialView={view === "signup" ? "signup" : "signin-form"}
      fromWelcome
      externalError={externalError}
      onGetStarted={() => setView("signup")}
      onBackToWelcome={() => setView("welcome")}
      onSignInSuccess={onSignInSuccess}
    />
  );
}
