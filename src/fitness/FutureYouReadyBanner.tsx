import { FUTURE_YOU_READY_BANNER_LABEL } from "./futureYouGenerationPillModel";

export function FutureYouReadyBanner() {
  return (
    <div className="future-you-ready-banner" role="status" aria-live="polite">
      <span className="future-you-ready-banner__text">{FUTURE_YOU_READY_BANNER_LABEL}</span>
    </div>
  );
}
