import { describe, expect, it } from "vitest";

import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE } from "./paywallPlans";

describe("paywallPlans", () => {
  it("matches reference yearly and monthly billing copy", () => {
    expect(PAYWALL_YEARLY_BADGE).toBe("61% OFF");
    expect(PAYWALL_PLANS.yearly.displayPerMonth).toBe("$5.83/mo");
    expect(PAYWALL_PLANS.yearly.trialNote).toBe("No trial, billed immediately");
    expect(PAYWALL_PLANS.yearly.billingNote).toBe("Billed at $69.99/yr.");
    expect(PAYWALL_PLANS.monthly.displayPerMonth).toBe("$14.99/mo");
    expect(PAYWALL_PLANS.monthly.trialNote).toBe("No trial, billed immediately");
    expect(PAYWALL_PLANS.monthly.billingNote).toBe("Billed at $14.99/mo.");
  });
});
