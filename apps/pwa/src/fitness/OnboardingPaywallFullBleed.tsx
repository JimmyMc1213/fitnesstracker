import type { FutureYouDraft } from "./futureYouDraft";
import { OnboardingPaywallFutureYouPoster } from "./OnboardingPaywallFutureYouPoster";
import type { OnboardingPlanSnapshot } from "./onboardingPlanSnapshot";
import {
  futureYouPaywallCtaLabel,
  isFutureYouPaywallCtaEnabled,
} from "./futureYouPaywallModel";
import type { FutureYouJobStatus } from "./futureYouJobs";
import type { UserGender } from "./types";

type Props = {
  onSelectTier: (tier: "free" | "pro") => void;
  onBack: () => void;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft;
  generationStatus: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
  photoBlocked: boolean;
  previewMode?: boolean;
};

/**
 * Full-bleed movie-poster paywall — preserved for A/B or re-enable.
 * Swap in OnboardingFlow: replace `<OnboardingPaywall … />` with `<OnboardingPaywallFullBleed … />`.
 */
export function OnboardingPaywallFullBleed({
  onSelectTier,
  onBack,
  planSnapshot,
  futureYou,
  generationStatus,
  gender,
  photoBlocked,
  previewMode = false,
}: Props) {
  const ctaEnabled = isFutureYouPaywallCtaEnabled(futureYou, generationStatus, photoBlocked);
  const ctaLabel = futureYouPaywallCtaLabel(futureYou, generationStatus, photoBlocked);

  return (
    <div className="onboarding-paywall onboarding-paywall--poster">
      <header className="onboarding-paywall__header onboarding-paywall__header--overlay">
        <button
          type="button"
          className="onboarding-paywall__back onboarding-paywall__back--overlay tap"
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

      <OnboardingPaywallFutureYouPoster
        timeline={planSnapshot.timeline}
        gender={gender}
        status={generationStatus}
        jobId={futureYou.generationJobId}
        previewMode={previewMode}
        ctaEnabled={ctaEnabled}
        ctaLabel={ctaLabel}
        onCta={() => onSelectTier("pro")}
      />
    </div>
  );
}
