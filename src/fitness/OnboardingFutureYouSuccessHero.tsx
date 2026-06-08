import { OnboardingFutureYouHeroImage } from "./OnboardingFutureYouHeroImage";
import { splitFutureYouTimelineForPaywall } from "./futureYouTimeline";

type Props = {
  timeline: string;
  imageSrc: string | null;
  loading?: boolean;
};

export function OnboardingFutureYouSuccessHero({ timeline, imageSrc, loading = false }: Props) {
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  return (
    <div className="onboarding-fy-success-hero" aria-busy={loading}>
      <div className="onboarding-paywall-future-you--inline">
        <div className="onboarding-paywall-future-you__image-reveal">
          <div className="onboarding-paywall-future-you__stage">
            <OnboardingFutureYouHeroImage imageSrc={imageSrc} preparing={loading} blur={false} />
          </div>
        </div>
      </div>
      <p className="onboarding-paywall-future-you__tagline onboarding-fy-success-hero__tagline">
        You in{" "}
        <span className="onboarding-paywall-future-you__timeline" aria-label={timeline}>
          {timelineValue}
          {timelineUnit}
        </span>
      </p>
    </div>
  );
}
