import { describe, expect, it } from "vitest";

import {
  PAYWALL_STORE_SETUP_MESSAGE,
  REVENUECAT_PRODUCT_IDS,
  sanitizeRevenueCatError,
} from "./revenueCatMessages";

describe("revenueCat", () => {
  it("uses the App Store Connect product IDs documented for launch", () => {
    expect(REVENUECAT_PRODUCT_IDS.monthly).toBe("newyouai_pro_monthly");
    expect(REVENUECAT_PRODUCT_IDS.yearly).toBe("newyouai_pro_yearly");
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
