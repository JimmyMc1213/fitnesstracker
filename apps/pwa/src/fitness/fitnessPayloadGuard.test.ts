import { describe, expect, it } from "vitest";

import { fitnessPayloadByteLength, isFitnessPayloadTooLarge, MAX_FITNESS_PAYLOAD_BYTES } from "./fitnessPayloadGuard";

describe("fitnessPayloadGuard", () => {
  it("measures serialized payload size", () => {
    const bytes = fitnessPayloadByteLength({ nutritionLog: [{ name: "Egg" }] });
    expect(bytes).toBeGreaterThan(10);
  });

  it("flags payloads over the max size", () => {
    const huge = { blob: "x".repeat(MAX_FITNESS_PAYLOAD_BYTES) };
    expect(isFitnessPayloadTooLarge(huge)).toBe(true);
  });

  it("allows normal-sized payloads", () => {
    expect(isFitnessPayloadTooLarge({ nutritionLog: [] })).toBe(false);
  });
});
