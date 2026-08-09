import { describe, expect, it } from "vitest";

import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE } from "./paywallPlans";
import { PAYWALL_TYPOGRAPHY } from "./paywallTypography";

describe("paywallPlans", () => {
  it("makes billed amount primary and monthly equivalent subordinate for yearly", () => {
    expect(PAYWALL_YEARLY_BADGE).toBe("61% OFF");
    expect(PAYWALL_PLANS.yearly.billedAmount).toBe("$69.99/yr");
    expect(PAYWALL_PLANS.yearly.calculatedPrice).toBe("Just $5.83/mo");
    expect(PAYWALL_PLANS.monthly.billedAmount).toBe("$14.99/mo");
    expect(PAYWALL_PLANS.monthly.calculatedPrice).toBeNull();
  });

  it("keeps billed amount typography larger than calculated monthly equivalent", () => {
    expect(PAYWALL_TYPOGRAPHY.planPrice.fontSize).toBeGreaterThan(PAYWALL_TYPOGRAPHY.planBilling.fontSize);
    expect(PAYWALL_TYPOGRAPHY.planPrice.fontSize).toBeGreaterThan(PAYWALL_TYPOGRAPHY.planTrial.fontSize);
    expect(PAYWALL_TYPOGRAPHY.planPrice.fontSize).toBeGreaterThan(PAYWALL_TYPOGRAPHY.planBadge.fontSize);
  });
});
