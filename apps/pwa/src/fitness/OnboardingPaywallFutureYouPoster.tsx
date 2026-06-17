import type { ReactNode } from "react";

import { OnboardingFutureYouHeroImage } from "./OnboardingFutureYouHeroImage";
import { paywallRevealDelaySec } from "./onboardingPaywallReveal";
import { splitFutureYouTimelineForPaywall } from "./futureYouTimeline";
import { useFutureYouPaywallImage } from "./useFutureYouPaywallImage";
import { PAYWALL_YEARLY_PRICE } from "./paywallPlans";
import type { FutureYouJobStatus } from "./futureYouJobs";
import type { UserGender } from "./types";

type Props = {
  timeline: string;
  gender: UserGender | undefined;
  status: FutureYouJobStatus | "idle";
  jobId: string | undefined;
  previewMode?: boolean;
  ctaEnabled: boolean;
  ctaLabel: string;
  onCta: () => void;
};

function PaywallReveal({
  step,
  variant = "vertical",
  className,
  children,
}: {
  step: number;
  variant?: "vertical" | "horizontal" | "headline";
  className?: string;
  children: ReactNode;
}) {
  const variantClass =
    variant === "horizontal" ? " onboarding-paywall__wave-item--horizontal"
    : variant === "headline" ? " onboarding-paywall__wave-item--headline"
    : "";
  return (
    <div
      className={`onboarding-paywall__wave-item${variantClass}${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${paywallRevealDelaySec(step)}s` }}
    >
      {children}
    </div>
  );
}

export function OnboardingPaywallFutureYouPoster({
  timeline,
  gender,
  status,
  jobId,
  previewMode = false,
  ctaEnabled,
  ctaLabel,
  onCta,
}: Props) {
  const { imageSrc, loading: imageLoading } = useFutureYouPaywallImage({
    jobId,
    gender,
    status,
    previewMode,
  });
  const preparing = status !== "ready" || imageLoading;
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  return (
    <div className="onboarding-paywall-future-you onboarding-paywall__poster" aria-busy={preparing}>
      <PaywallReveal step={1} variant="horizontal" className="onboarding-paywall__poster-media-reveal">
        <div className="onboarding-paywall__poster-media">
          <OnboardingFutureYouHeroImage imageSrc={imageSrc} preparing={preparing} />
        </div>
      </PaywallReveal>

      <div className="onboarding-paywall__poster-scrim" aria-hidden />

      <div className="onboarding-paywall__poster-copy">
        <PaywallReveal step={0} variant="headline">
          <h1 className="onboarding-paywall__poster-title">
            <span className="onboarding-goal-weight-accent">Future You</span> is ready
          </h1>
        </PaywallReveal>

        <PaywallReveal step={2} variant="headline">
          <p className="onboarding-paywall-future-you__headline">
            You in{" "}
            <span className="onboarding-paywall-future-you__timeline" aria-label={timeline}>
              <span className="onboarding-paywall-future-you__timeline-blur">{timelineValue}</span>
              {timelineUnit}
            </span>
          </p>
        </PaywallReveal>
      </div>

      <div className="onboarding-paywall__poster-dock">
        <button
          type="button"
          className="tap onboarding-paywall__cta onboarding-paywall__cta--poster"
          disabled={!ctaEnabled}
          aria-disabled={!ctaEnabled}
          onClick={onCta}
        >
          {ctaLabel}
        </button>
        <p className="onboarding-paywall__pricing onboarding-paywall__pricing--poster">
          Just ${PAYWALL_YEARLY_PRICE.toFixed(2)} per year (${(PAYWALL_YEARLY_PRICE / 12).toFixed(2)}/mo)
        </p>
      </div>
    </div>
  );
}
