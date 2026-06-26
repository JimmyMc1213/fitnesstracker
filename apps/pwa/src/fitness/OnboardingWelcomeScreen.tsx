import { useEffect, useState } from "react";

import { bootSplashPresent } from "./bootSplash";
import { GymmySplashMark } from "./GymmySplashMark";
import { WELCOME_SPLASH_HOLD_MS } from "./splashTiming";
import { markWelcomeSplashPlayed, welcomeSplashAlreadyPlayed } from "./welcomeSplash";

type Phase = "splash" | "welcome";

type OnboardingWelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn?: () => void;
  /** Auth entry: "Already have an account? Sign in". Onboarding step 0: switch account. */
  signInPrompt?: "existing-account" | "switch-account";
};

function PhonePreviewPlaceholder() {
  return (
    <div className="onboarding-welcome__preview" aria-hidden>
      <span className="onboarding-welcome__preview-label">App Preview</span>
    </div>
  );
}

export function OnboardingWelcomeScreen({
  onGetStarted,
  onSignIn,
  signInPrompt = "existing-account",
}: OnboardingWelcomeScreenProps) {
  const [phase, setPhase] = useState<Phase>(() =>
    welcomeSplashAlreadyPlayed() ? "welcome" : "splash",
  );
  const [splashInstant] = useState(() => bootSplashPresent());

  useEffect(() => {
    if (phase !== "splash") return;
    markWelcomeSplashPlayed();
    const id = window.setTimeout(() => setPhase("welcome"), WELCOME_SPLASH_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <div
      className={`onboarding-welcome${phase === "welcome" ? " onboarding-welcome--ready" : ""}`}
      aria-label={phase === "splash" ? "Loading NewYou" : "Welcome to NewYou"}
    >
      <div className="onboarding-welcome__splash-layer" aria-hidden={phase !== "splash"}>
        <GymmySplashMark instant={splashInstant} />
      </div>

      <div className="onboarding-welcome__landing" aria-hidden={phase !== "welcome"}>
        <div className="onboarding-welcome__brand-row motion-welcome-brand">
          <GymmySplashMark instant />
        </div>

        <div className="onboarding-welcome__hero motion-welcome-hero">
          <PhonePreviewPlaceholder />
        </div>

        <div className="onboarding-welcome__copy motion-welcome-copy">
          <h1 className="onboarding-welcome__headline">Your program. Smarter every session.</h1>
          <p className="onboarding-welcome__subline">
            Progressive training and nutrition, built around you.
          </p>
        </div>

        <div className="onboarding-welcome__actions motion-welcome-actions">
          <button type="button" className="onboarding-welcome__cta tap" onClick={onGetStarted}>
            Get Started
          </button>
          {onSignIn ? (
            <p className="onboarding-welcome__signin">
              {signInPrompt === "switch-account" ? "Use a different account?" : "Already have an account?"}{" "}
              <button type="button" className="onboarding-welcome__signin-link tap" onClick={onSignIn}>
                {signInPrompt === "switch-account" ? "Sign out" : "Sign in"}
              </button>
            </p>
          ) : null}
          {/* Apple Sign-In button goes here */}
        </div>
      </div>
    </div>
  );
}
