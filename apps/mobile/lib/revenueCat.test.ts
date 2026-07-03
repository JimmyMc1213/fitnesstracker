import { describe, expect, it } from "vitest";

import {
  customerInfoGrantsPro,
  PAYWALL_ENTITLEMENT_NOT_GRANTED_MESSAGE,
  PAYWALL_STORE_SETUP_MESSAGE,
  REVENUECAT_PRODUCT_IDS,
  sanitizeRevenueCatError,
} from "./revenueCatMessages";

describe("revenueCat", () => {
  it("uses the App Store Connect product IDs documented for launch", () => {
    expect(REVENUECAT_PRODUCT_IDS.monthly).toBe("newyouai_pro_monthly");
    expect(REVENUECAT_PRODUCT_IDS.yearly).toBe("newyouai_pro_yearly");
  });

  it("grants pro when the pro entitlement is active", () => {
    expect(customerInfoGrantsPro(["pro"], [])).toBe(true);
  });

  it("grants pro when a known subscription product is active", () => {
    expect(customerInfoGrantsPro([], [REVENUECAT_PRODUCT_IDS.yearly])).toBe(true);
    expect(customerInfoGrantsPro([], [REVENUECAT_PRODUCT_IDS.monthly])).toBe(true);
  });

  it("grants pro when a known product has a future expiration date", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(
      customerInfoGrantsPro([], [], {
        [REVENUECAT_PRODUCT_IDS.yearly]: future,
      }),
    ).toBe(true);
  });

  it("does not grant pro without entitlement or known subscription", () => {
    expect(customerInfoGrantsPro([], [])).toBe(false);
    expect(customerInfoGrantsPro(["premium"], ["other_product"])).toBe(false);
    expect(
      customerInfoGrantsPro([], [], {
        [REVENUECAT_PRODUCT_IDS.yearly]: "2020-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("uses actionable copy when purchase does not grant access", () => {
    expect(PAYWALL_ENTITLEMENT_NOT_GRANTED_MESSAGE).toContain("Restore Purchases");
  });

  it("maps RevenueCat configuration errors to setup copy", () => {
    expect(
      sanitizeRevenueCatError(
        "There's a problem with your configuration. None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect.",
      ),
    ).toBe(PAYWALL_STORE_SETUP_MESSAGE);
  });

  it("hides user-cancelled purchase errors", () => {
    expect(sanitizeRevenueCatError("Purchase was cancelled by the user")).toBeNull();
  });

  it("passes through unknown errors unchanged", () => {
    expect(sanitizeRevenueCatError("Card declined")).toBe("Card declined");
  });
});
