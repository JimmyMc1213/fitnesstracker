/** Stagger timing for paywall wave reveals. RN mirror of the PWA `onboardingPaywallReveal.ts`. */
export const PAYWALL_REVEAL_LEAD_MS = 900;
export const PAYWALL_REVEAL_INITIAL_MS = 200;
export const PAYWALL_REVEAL_STEP_MS = 400;
/** Pause after headline, and again after the Future You cluster before billing. */
export const PAYWALL_REVEAL_GROUP_PAUSE_MS = 500;

const PAYWALL_REVEAL_START_MS = PAYWALL_REVEAL_LEAD_MS + PAYWALL_REVEAL_INITIAL_MS;

/** Reveal delay (ms) for a given stagger step. Matches PWA `paywallRevealDelaySec` * 1000. */
export function paywallRevealDelayMs(stepIndex: number): number {
  if (stepIndex <= 0) {
    return PAYWALL_REVEAL_START_MS;
  }

  const heroClusterStartMs = PAYWALL_REVEAL_START_MS + PAYWALL_REVEAL_GROUP_PAUSE_MS;

  if (stepIndex <= 3) {
    return heroClusterStartMs + (stepIndex - 1) * PAYWALL_REVEAL_STEP_MS;
  }

  const billingStartMs =
    heroClusterStartMs + 2 * PAYWALL_REVEAL_STEP_MS + PAYWALL_REVEAL_GROUP_PAUSE_MS;

  return billingStartMs + (stepIndex - 4) * PAYWALL_REVEAL_STEP_MS;
}

/** Footer reveal — after title (+ Future You or plan summary when shown). */
export function paywallFooterStartStep(heroVisible: boolean): number {
  return heroVisible ? 4 : 2;
}
