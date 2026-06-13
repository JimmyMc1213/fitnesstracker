import { describe, expect, it } from "vitest";

import {
  fitnessPayloadByteLength,
  isFitnessPayloadTooLarge,
  MAX_FITNESS_PAYLOAD_BYTES,
} from "./fitnessPayloadGuard";

describe("fitnessPayloadGuard", () => {
  it("measures JSON byte length", () => {
    expect(fitnessPayloadByteLength({ a: 1 })).toBeGreaterThan(0);
  });

  it("flags payloads over MAX_FITNESS_PAYLOAD_BYTES", () => {
    const big = { blob: "x".repeat(MAX_FITNESS_PAYLOAD_BYTES) };
    expect(isFitnessPayloadTooLarge(big)).toBe(true);
  });

  it("allows small payloads", () => {
    expect(isFitnessPayloadTooLarge({ ok: true })).toBe(false);
  });
});
