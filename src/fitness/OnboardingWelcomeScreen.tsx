import { useEffect, useState } from "react";

import welcomeWorkoutScreenshot from "../assets/onboarding/welcome-workout-active-session.png";

type Phase = "splash" | "welcome";

type OnboardingWelcomeScreenProps = {
  onGetStarted: () => void;
  onSignIn?: () => void;
};

function LogoPlaceholder() {
  return (
    <div className="onboarding-welcome__logo-placeholder" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
        <rect x="6.5" y="9.5" width="2.5" height="5" rx="1.25" fill="currentColor" />
        <rect x="9" y="11" width="6" height="2" rx="1" fill="currentColor" />
        <rect x="15" y="9.5" width="2.5" height="5" rx="1.25" fill="currentColor" />
        <rect x="18" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

function PhoneHeroMockup() {
  return (
    <div className="onboarding-welcome__phone" aria-hidden>
      <span className="onboarding-welcome__brand">Gymmy</span>
      <div className="onboarding-welcome__phone-bezel">
        <div className="onboarding-welcome__phone-screen">
          <img
            className="onboarding-welcome__phone-screenshot"
            src={welcomeWorkoutScreenshot}
            alt=""
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export function OnboardingWelcomeScreen({ onGetStarted, onSignIn }: OnboardingWelcomeScreenProps) {
  const [phase, setPhase] = useState<Phase>("splash");

  useEffect(() => {
    const id = window.setTimeout(() => setPhase("welcome"), 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={`onboarding-welcome${phase === "welcome" ? " onboarding-welcome--ready" : ""}`}
      aria-label={phase === "splash" ? "Loading Gymmy" : "Welcome to Gymmy"}
    >
      <div className="onboarding-welcome__splash-layer" aria-hidden={phase !== "splash"}>
        <div className="onboarding-welcome__mark motion-splash-mark">
          <LogoPlaceholder />
          <span className="onboarding-welcome__wordmark">Gymmy</span>
        </div>
      </div>

      <div className="onboarding-welcome__landing" aria-hidden={phase !== "welcome"}>
        <div className="onboarding-welcome__hero motion-welcome-hero">
          <PhoneHeroMockup />
        </div>

        <div className="onboarding-welcome__copy motion-welcome-copy">
          <h1 className="onboarding-welcome__headline">Your coach. Your plan. Your transformation.</h1>
        </div>

        <div className="onboarding-welcome__actions motion-welcome-actions">
          <button type="button" className="onboarding-welcome__cta tap" onClick={onGetStarted}>
            Get Started
          </button>
          <button type="button" className="onboarding-welcome__signin tap" onClick={onSignIn}>
            Already have an account? <strong>Sign In</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
