import { OnboardingFutureYouSuccessHero } from "./OnboardingFutureYouSuccessHero";
import { OnboardingFutureYouSuccessPlanCard } from "./OnboardingFutureYouSuccessPlanCard";
import type { OnboardingPlanSnapshot } from "./onboardingPlanSnapshot";
import {
  FUTURE_YOU_SUCCESS_AI_LABEL,
  FUTURE_YOU_SUCCESS_CTA_LABEL,
  FUTURE_YOU_SUCCESS_TAGLINE,
  FUTURE_YOU_SUCCESS_WELCOME_BRAND,
  FUTURE_YOU_SUCCESS_WELCOME_PREFIX,
  formatFutureYouSuccessHeadline,
  isFutureYouSuccessHeroVisible,
} from "./futureYouSuccessModel";
import type { FutureYouDraft } from "./futureYouDraft";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { FutureYouReportButton } from "./FutureYouReportButton";
import { useFutureYouRevealImage } from "./useFutureYouRevealImage";
import type { SubscriptionTier, UserGender } from "./types";

type Props = {
  timeline: string;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft;
  generationStatus: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
  photoBlocked: boolean;
  regionBlocked?: boolean;
  subscriptionTier: SubscriptionTier;
  displayName: string;
  previewMode?: boolean;
  onContinue: () => void;
  onReported?: (jobId: string) => void;
};

export function OnboardingFutureYouSuccess({
  timeline,
  planSnapshot,
  futureYou,
  generationStatus,
  gender,
  photoBlocked,
  regionBlocked = false,
  subscriptionTier,
  displayName,
  previewMode = false,
  onContinue,
  onReported,
}: Props) {
  const heroVisible = isFutureYouSuccessHeroVisible(futureYou, photoBlocked || regionBlocked);
  const { imageSrc, loading } = useFutureYouRevealImage({
    jobId: futureYou.generationJobId,
    gender,
    status: generationStatus,
    subscriptionTier,
    previewMode,
  });

  if (!heroVisible) {
    return (
      <div className="onboarding-fy-success onboarding-fy-success--plan-only">
        <div className="onboarding-fy-success__center">
          <div className="onboarding-fy-success__content">
            <div className="onboarding-fy-success__trophy" aria-hidden>
              ✓
            </div>
            <h1 className="onboarding-fy-success__headline onboarding-fy-success__headline--plan-only">
              {formatFutureYouSuccessHeadline(displayName)}
            </h1>
            <p className="onboarding-fy-success__tagline">{FUTURE_YOU_SUCCESS_TAGLINE}</p>
            <OnboardingFutureYouSuccessPlanCard planSnapshot={planSnapshot} />
            <p className="onboarding-fy-success__welcome-gold">
              {FUTURE_YOU_SUCCESS_WELCOME_PREFIX}
              {FUTURE_YOU_SUCCESS_WELCOME_BRAND}
            </p>
          </div>
        </div>

        <footer className="onboarding-fy-success__footer onboarding-fy-success__footer--pinned">
          <button
            type="button"
            className="tap onboarding-paywall__cta onboarding-paywall__cta--gold onboarding-fy-success__cta"
            onClick={onContinue}
          >
            {FUTURE_YOU_SUCCESS_CTA_LABEL}
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="onboarding-fy-success onboarding-fy-success--hero">
      <div className="onboarding-fy-success__body">
        <h1 className="onboarding-fy-success__headline">
          Meet your <span className="onboarding-goal-weight-accent">Future You</span>
        </h1>

        <OnboardingFutureYouSuccessHero timeline={timeline} imageSrc={imageSrc} loading={loading} />

        <p className="onboarding-fy-success__ai-label">{FUTURE_YOU_SUCCESS_AI_LABEL}</p>
        <FutureYouReportButton
          jobId={futureYou.generationJobId}
          context="onboarding_success"
          previewMode={previewMode}
          className="onboarding-fy-success__report"
          onReported={onReported}
        />
      </div>

      <footer className="onboarding-fy-success__footer">
        <p className="onboarding-fy-success__welcome">
          {FUTURE_YOU_SUCCESS_WELCOME_PREFIX}
          <span className="onboarding-goal-weight-accent">{FUTURE_YOU_SUCCESS_WELCOME_BRAND}</span>
        </p>
        <button
          type="button"
          className="tap onboarding-paywall__cta onboarding-paywall__cta--gold onboarding-fy-success__cta"
          disabled={loading}
          aria-disabled={loading}
          onClick={onContinue}
        >
          {FUTURE_YOU_SUCCESS_CTA_LABEL}
        </button>
      </footer>
    </div>
  );
}
