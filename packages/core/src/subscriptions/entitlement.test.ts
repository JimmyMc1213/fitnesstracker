import { describe, expect, it } from "vitest";

import { isSubscriptionRowEntitled } from "./entitlement";

const NOW = Date.parse("2026-06-30T00:00:00.000Z");

describe("isSubscriptionRowEntitled", () => {
  it("denies when row is missing", () => {
    expect(isSubscriptionRowEntitled(null, NOW)).toBe(false);
    expect(isSubscriptionRowEntitled(undefined, NOW)).toBe(false);
  });

  it("denies when not active", () => {
    expect(isSubscriptionRowEntitled({ is_active: false, expires_at: null }, NOW)).toBe(false);
  });

  it("grants when active with no expiration (lifetime / non-renewing)", () => {
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: null }, NOW)).toBe(true);
  });

  it("grants when active and expiration is in the future", () => {
    const future = new Date(NOW + 60_000).toISOString();
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: future }, NOW)).toBe(true);
  });

  it("denies when active but expiration has passed", () => {
    const past = new Date(NOW - 60_000).toISOString();
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: past }, NOW)).toBe(false);
  });

  it("grants when expiration is unparseable but row is active", () => {
    expect(isSubscriptionRowEntitled({ is_active: true, expires_at: "not-a-date" }, NOW)).toBe(true);
  });
});
