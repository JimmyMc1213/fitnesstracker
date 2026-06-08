import type { ReactNode } from "react";

import { OnboardingFutureYouHeroImage } from "./OnboardingFutureYouHeroImage";
import { paywallRevealDelaySec } from "./onboardingPaywallReveal";
import { splitFutureYouTimelineForPaywall } from "./futureYouTimeline";
import { useFutureYouPaywallImage } from "./useFutureYouPaywallImage";
import type { FutureYouJobStatus } from "./futureYouJobs";
import type { UserGender } from "./types";

type Props = {
  timeline: string;
  gender: UserGender | undefined;
  status: FutureYouJobStatus | "idle";
  jobId: string | undefined;
  previewMode?: boolean;
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

export function OnboardingPaywallFutureYouHero({
  timeline,
  gender,
  status,
  jobId,
  previewMode = false,
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
    <div className="onboarding-paywall-future-you onboarding-paywall-future-you--inline" aria-busy={preparing}>
      <PaywallReveal step={1} variant="headline">
        <p className="onboarding-paywall-future-you__ready">
          <span className="onboarding-goal-weight-accent">Future You</span> is ready
        </p>
      </PaywallReveal>
      <PaywallReveal step={2} variant="horizontal" className="onboarding-paywall-future-you__image-reveal">
        <div className="onboarding-paywall-future-you__stage">
          <OnboardingFutureYouHeroImage imageSrc={imageSrc} preparing={preparing} />
        </div>
      </PaywallReveal>
      <PaywallReveal step={3} variant="headline">
        <p className="onboarding-paywall-future-you__tagline">
          You in{" "}
          <span className="onboarding-paywall-future-you__timeline" aria-label={timeline}>
            <span className="onboarding-paywall-future-you__timeline-blur">{timelineValue}</span>
            {timelineUnit}
          </span>
        </p>
      </PaywallReveal>
    </div>
  );
}
