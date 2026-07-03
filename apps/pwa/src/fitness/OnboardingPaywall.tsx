import { useState, type ReactNode } from "react";

import type { FutureYouDraft } from "./futureYouDraft";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "./futureYouLegal";
import { OnboardingPaywallFutureYouHero } from "./OnboardingPaywallFutureYouHero";
import { OnboardingPaywallPlanPicker } from "./OnboardingPaywallPlanPicker";
import { OnboardingPaywallPlanSummary } from "./OnboardingPaywallPlanSummary";
import type { PaywallBillingPeriod } from "./paywallPlans";
import type { OnboardingPlanSnapshot } from "./onboardingPlanSnapshot";
import {
  paywallFooterStartStep,
  paywallRevealDelaySec,
} from "./onboardingPaywallReveal";
import {
  futureYouPaywallCtaLabel,
  isFutureYouPaywallCtaEnabled,
  isFutureYouPaywallHeroVisible,
} from "./futureYouPaywallModel";
import type { FutureYouJobStatus } from "./futureYouJobs";
import type { UserGender } from "./types";

type Props = {
  onSelectTier: (tier: "pro") => void;
  onBack: () => void;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft;
  generationStatus: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
  photoBlocked: boolean;
  previewMode?: boolean;
};

function PaywallReveal({
  step,
  variant = "vertical",
  className,
  children,
}: {
  step: number;
  variant?: "vertical" | "headline";
  className?: string;
  children: ReactNode;
}) {
  const variantClass =
    variant === "headline" ? " onboarding-paywall__wave-item--headline" : " onboarding-paywall__wave-item--vertical";
  return (
    <div
      className={`onboarding-paywall__wave-item${variantClass}${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${paywallRevealDelaySec(step)}s` }}
    >
      {children}
    </div>
  );
}

export function OnboardingPaywall({
  onSelectTier,
  onBack,
  planSnapshot,
  futureYou,
  generationStatus,
  gender,
  photoBlocked,
  previewMode = false,
}: Props) {
  const [billingPeriod, setBillingPeriod] = useState<PaywallBillingPeriod>("yearly");
  const heroVisible = isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
  const ctaEnabled = isFutureYouPaywallCtaEnabled(futureYou, generationStatus, photoBlocked);
  const ctaLabel = futureYouPaywallCtaLabel(
    futureYou,
    generationStatus,
    photoBlocked,
    billingPeriod,
  );
  const footerStartStep = paywallFooterStartStep(heroVisible);

  return (
    <div className={`onboarding-paywall${heroVisible ? " onboarding-paywall--hero" : " onboarding-paywall--plan-only"}`}>
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
        <PaywallReveal step={0} variant="headline">
          <h1 className="onboarding-paywall__headline">
            {heroVisible ? (
              <>
                Unlock <span className="onboarding-goal-weight-accent">NewYou AI</span> to see what you
                can look like.
              </>
            ) : (
              <>
                Unlock <span className="onboarding-goal-weight-accent">NewYou AI</span> to reach your
                goals faster.
              </>
            )}
          </h1>
        </PaywallReveal>

        {heroVisible ? (
          <OnboardingPaywallFutureYouHero
            timeline={planSnapshot.timeline}
            gender={gender}
            status={generationStatus}
            jobId={futureYou.generationJobId}
            previewMode={previewMode}
          />
        ) : (
          <PaywallReveal step={1} className="onboarding-paywall__wave-item--stretch">
            <OnboardingPaywallPlanSummary planSnapshot={planSnapshot} />
          </PaywallReveal>
        )}
      </div>

      <footer className="onboarding-paywall__footer">
        <div className="onboarding-paywall__checkout">
          <PaywallReveal step={footerStartStep}>
            <OnboardingPaywallPlanPicker value={billingPeriod} onChange={setBillingPeriod} />
          </PaywallReveal>
          <PaywallReveal step={footerStartStep + 1}>
            <button
              type="button"
              className="tap onboarding-paywall__cta onboarding-paywall__cta--gold"
              disabled={!ctaEnabled}
              aria-disabled={!ctaEnabled}
              onClick={() => onSelectTier("pro")}
            >
              {ctaLabel}
            </button>
          </PaywallReveal>
        </div>
        <PaywallReveal step={footerStartStep + 2}>
          <nav className="onboarding-paywall__legal" aria-label="Subscription options">
            <button type="button" className="onboarding-paywall__legal-link tap">
              Restore Purchases
            </button>
            <a
              href={PAYWALL_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="onboarding-paywall__legal-link"
            >
              Terms
            </a>
            <a
              href={FUTURE_YOU_PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="onboarding-paywall__legal-link"
            >
              Privacy
            </a>
          </nav>
        </PaywallReveal>
      </footer>
    </div>
  );
}
