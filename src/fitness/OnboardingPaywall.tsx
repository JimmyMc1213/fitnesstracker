import type { ReactNode } from "react";

type Props = {
  onSelectTier: (tier: "free" | "pro") => void;
  onBack: () => void;
  /** Optional preview content inside the phone mockup. */
  phonePreview?: ReactNode;
};

function PaywallPhonePlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div className="onboarding-paywall__phone" aria-hidden={!children}>
      <div className="onboarding-paywall__phone-bezel">
        <div className="onboarding-paywall__phone-screen">{children}</div>
      </div>
    </div>
  );
}

export function OnboardingPaywall({ onSelectTier, onBack, phonePreview }: Props) {
  return (
    <div className="onboarding-paywall">
      <header className="onboarding-paywall__header">
        <button
          type="button"
          className="onboarding-paywall__back tap"
          onClick={onBack}
          aria-label="Back"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
      </header>

      <div className="onboarding-paywall__body">
        <h1 className="onboarding-paywall__headline">Unlock Gymmy to reach your goals faster.</h1>

        <div className="onboarding-paywall__hero">
          <PaywallPhonePlaceholder>{phonePreview}</PaywallPhonePlaceholder>
        </div>
      </div>

      <footer className="onboarding-paywall__footer">
        <p className="onboarding-paywall__trust">✓ No Payment Due Now</p>
        <button type="button" className="tap onboarding-paywall__cta" onClick={() => onSelectTier("pro")}>
          Continue
        </button>
        <p className="onboarding-paywall__pricing">Just $79.99 per year ($6.67/mo)</p>
        <button type="button" className="tap onboarding-paywall__free-link" onClick={() => onSelectTier("free")}>
          Continue with free
        </button>
      </footer>
    </div>
  );
}
