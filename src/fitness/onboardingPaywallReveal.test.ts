import { describe, expect, it } from "vitest";

import {
  PAYWALL_REVEAL_GROUP_PAUSE_MS,
  PAYWALL_REVEAL_STEP_MS,
  paywallFooterStartStep,
  paywallRevealDelaySec,
} from "./onboardingPaywallReveal";

describe("onboardingPaywallReveal", () => {
  it("reveals the headline first, then pauses before the next cluster", () => {
    expect(paywallRevealDelaySec(0)).toBeCloseTo(1.1, 2);
    expect(paywallRevealDelaySec(1)).toBeCloseTo(1.6, 2);
    expect(paywallRevealDelaySec(1) - paywallRevealDelaySec(0)).toBeCloseTo(
      PAYWALL_REVEAL_GROUP_PAUSE_MS / 1000,
      2,
    );
  });

  it("staggers Future You cluster items, then pauses before billing", () => {
    expect(paywallRevealDelaySec(2)).toBeCloseTo(2.0, 2);
    expect(paywallRevealDelaySec(3)).toBeCloseTo(2.4, 2);
    expect(paywallRevealDelaySec(4)).toBeCloseTo(2.9, 2);
    expect(paywallRevealDelaySec(4) - paywallRevealDelaySec(3)).toBeCloseTo(
      PAYWALL_REVEAL_GROUP_PAUSE_MS / 1000,
      2,
    );
    expect(paywallRevealDelaySec(5)).toBeCloseTo(3.3, 2);
    expect(paywallRevealDelaySec(5) - paywallRevealDelaySec(4)).toBeCloseTo(
      PAYWALL_REVEAL_STEP_MS / 1000,
      2,
    );
  });

  it("offsets footer after the Future You hero or plan summary and benefits", () => {
    expect(paywallFooterStartStep(true)).toBe(4);
    expect(paywallFooterStartStep(false)).toBe(2);
  });
});
