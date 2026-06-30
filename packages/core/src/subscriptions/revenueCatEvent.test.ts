import { describe, expect, it } from "vitest";

import { computeIsActive, mapRevenueCatEvent } from "./revenueCatEvent";

const NOW = Date.parse("2026-06-30T00:00:00.000Z");
const FUTURE_MS = NOW + 30 * 24 * 60 * 60 * 1000;
const PAST_MS = NOW - 60_000;

function body(event: Record<string, unknown>) {
  return { event };
}

describe("computeIsActive", () => {
  it("is false for EXPIRATION regardless of expiration time", () => {
    expect(computeIsActive("EXPIRATION", FUTURE_MS, NOW)).toBe(false);
  });

  it("is false for SUBSCRIPTION_PAUSED", () => {
    expect(computeIsActive("SUBSCRIPTION_PAUSED", FUTURE_MS, NOW)).toBe(false);
  });

  it("is true when expiration is in the future", () => {
    expect(computeIsActive("RENEWAL", FUTURE_MS, NOW)).toBe(true);
  });

  it("is false when expiration has passed", () => {
    expect(computeIsActive("RENEWAL", PAST_MS, NOW)).toBe(false);
  });

  it("treats CANCELLATION as active until expiration", () => {
    expect(computeIsActive("CANCELLATION", FUTURE_MS, NOW)).toBe(true);
    expect(computeIsActive("CANCELLATION", PAST_MS, NOW)).toBe(false);
  });

  it("grants purchase-like events with no expiration", () => {
    expect(computeIsActive("INITIAL_PURCHASE", null, NOW)).toBe(true);
    expect(computeIsActive("NON_RENEWING_PURCHASE", null, NOW)).toBe(true);
  });

  it("denies unknown events with no expiration", () => {
    expect(computeIsActive("BILLING_ISSUE", null, NOW)).toBe(false);
  });
});

describe("mapRevenueCatEvent", () => {
  it("rejects missing event", () => {
    expect(mapRevenueCatEvent(null, NOW).kind).toBe("invalid");
    expect(mapRevenueCatEvent({}, NOW).kind).toBe("invalid");
  });

  it("rejects missing app_user_id", () => {
    const result = mapRevenueCatEvent(body({ type: "INITIAL_PURCHASE" }), NOW);
    expect(result.kind).toBe("invalid");
  });

  it("ignores TEST / alias / transfer events", () => {
    expect(mapRevenueCatEvent(body({ type: "TEST", app_user_id: "u1" }), NOW).kind).toBe("ignore");
    expect(mapRevenueCatEvent(body({ type: "TRANSFER", app_user_id: "u1" }), NOW).kind).toBe(
      "ignore",
    );
  });

  it("maps an initial purchase to an active upsert", () => {
    const result = mapRevenueCatEvent(
      body({
        type: "INITIAL_PURCHASE",
        id: "evt_1",
        app_user_id: "user-123",
        product_id: "newyouai_pro_yearly",
        entitlement_ids: ["pro"],
        expiration_at_ms: FUTURE_MS,
        store: "APP_STORE",
      }),
      NOW,
    );

    expect(result).toEqual({
      kind: "upsert",
      userId: "user-123",
      record: {
        entitlement: "pro",
        is_active: true,
        product_id: "newyouai_pro_yearly",
        store: "APP_STORE",
        expires_at: new Date(FUTURE_MS).toISOString(),
        rc_event_id: "evt_1",
      },
    });
  });

  it("maps an expiration to an inactive upsert", () => {
    const result = mapRevenueCatEvent(
      body({
        type: "EXPIRATION",
        id: "evt_2",
        app_user_id: "user-123",
        product_id: "newyouai_pro_monthly",
        entitlement_ids: ["pro"],
        expiration_at_ms: PAST_MS,
        store: "APP_STORE",
      }),
      NOW,
    );

    expect(result.kind).toBe("upsert");
    if (result.kind === "upsert") {
      expect(result.record.is_active).toBe(false);
    }
  });

  it("prefers the pro entitlement and tolerates numeric-string expirations", () => {
    const result = mapRevenueCatEvent(
      body({
        type: "RENEWAL",
        id: "evt_3",
        app_user_id: "user-9",
        entitlement_ids: ["other", "pro"],
        expiration_at_ms: String(FUTURE_MS),
      }),
      NOW,
    );

    expect(result.kind).toBe("upsert");
    if (result.kind === "upsert") {
      expect(result.record.entitlement).toBe("pro");
      expect(result.record.is_active).toBe(true);
      expect(result.record.expires_at).toBe(new Date(FUTURE_MS).toISOString());
    }
  });
});
