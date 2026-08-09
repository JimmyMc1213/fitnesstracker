import { describe, expect, it } from "vitest";

import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE } from "./paywallPlans";

describe("paywallPlans", () => {
  it("keeps billed amount as the primary yearly price string", () => {
    expect(PAYWALL_YEARLY_BADGE).toBe("61% OFF");
    expect(PAYWALL_PLANS.yearly.billedAmount).toBe("$69.99/yr");
    expect(PAYWALL_PLANS.yearly.calculatedPrice).toBe("Just $5.83/mo");
    expect(PAYWALL_PLANS.yearly.trialNote).toBe("No trial, billed immediately");
    expect(PAYWALL_PLANS.monthly.billedAmount).toBe("$14.99/mo");
    expect(PAYWALL_PLANS.monthly.calculatedPrice).toBeNull();
    expect(PAYWALL_PLANS.monthly.trialNote).toBe("No trial, billed immediately");
  });
});
