import { describe, expect, it } from "vitest";

import { grantsProAccess, isSubscriptionRowEntitled } from "./entitlement";

const NOW = Date.parse("2026-06-01T00:00:00.000Z");

describe("isSubscriptionRowEntitled", () => {
  it("does not grant when there is no row", () => {
    expect(isSubscriptionRowEntitled(null, NOW)).toBe(false);
    expect(isSubscriptionRowEntitled(undefined, NOW)).toBe(false);
  });

  it("does not grant an inactive override", () => {
    expect(isSubscriptionRowEntitled({ is_active: false, expires_at: null }, NOW)).toBe(false);
  });

  it("grants an active admin override with no expiration", () => {
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: null }, NOW)).toBe(true);
  });

  it("grants an active row that has not expired", () => {
    const future = "2026-07-01T00:00:00.000Z";
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: future }, NOW)).toBe(true);
  });

  it("does not grant an expired row", () => {
    const past = "2026-05-01T00:00:00.000Z";
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: past }, NOW)).toBe(false);
  });

  it("grants an active row with an unparseable expiration", () => {
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: "not-a-date" }, NOW)).toBe(true);
  });
});

describe("grantsProAccess", () => {
  it("grants when RevenueCat is active even if the server row is inactive", () => {
    expect(
      grantsProAccess({
        revenueCatActive: true,
        subscription: { is_active: false, expires_at: null },
        nowMs: NOW,
      }),
    ).toBe(true);
  });

  it("grants an admin override when RevenueCat has no purchase", () => {
    expect(
      grantsProAccess({
        revenueCatActive: false,
        subscription: { is_active: true, expires_at: null },
        nowMs: NOW,
      }),
    ).toBe(true);
  });

  it("does not grant when neither source is active", () => {
    expect(
      grantsProAccess({
        revenueCatActive: false,
        subscription: { is_active: false, expires_at: null },
        nowMs: NOW,
      }),
    ).toBe(false);
  });
});
