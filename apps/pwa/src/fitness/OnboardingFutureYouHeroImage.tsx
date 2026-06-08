import { FUTURE_YOU_HERO_LOADING_LABEL } from "./futureYouHeroCopy";

type Props = {
  imageSrc: string | null;
  preparing: boolean;
  /** Blurred paywall teaser; omit on post-pay success hero. */
  blur?: boolean;
};

function HeroSpinner() {
  return <span className="onboarding-paywall-future-you__spinner" aria-hidden />;
}

export function OnboardingFutureYouHeroImage({ imageSrc, preparing, blur = true }: Props) {
  return (
    <div className="onboarding-paywall-future-you__image-wrap">
      {imageSrc ?
        <img src={imageSrc} alt="" aria-hidden className="onboarding-paywall-future-you__image" />
      : <div className="onboarding-paywall-future-you__placeholder" aria-hidden />}
      {blur && imageSrc ?
        <div className="onboarding-paywall-future-you__blur-overlay" aria-hidden />
      : null}
      {preparing ?
        <div className="onboarding-paywall-future-you__preparing">
          <HeroSpinner />
          <p className="onboarding-paywall-future-you__loading-label">{FUTURE_YOU_HERO_LOADING_LABEL}</p>
        </div>
      : null}
    </div>
  );
}
