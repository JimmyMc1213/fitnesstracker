import { describe, expect, it } from "vitest";

import { isFutureYouPhotoBlocked, isFutureYouPhotoEligible } from "./futureYouAge";

describe("isFutureYouPhotoBlocked", () => {
  it("blocks ages 13–17", () => {
    expect(isFutureYouPhotoBlocked(13)).toBe(true);
    expect(isFutureYouPhotoBlocked(17)).toBe(true);
  });

  it("allows adults and children under 13", () => {
    expect(isFutureYouPhotoBlocked(18)).toBe(false);
    expect(isFutureYouPhotoBlocked(12)).toBe(false);
    expect(isFutureYouPhotoBlocked(null)).toBe(false);
  });
});

describe("isFutureYouPhotoEligible", () => {
  it("requires 18+", () => {
    expect(isFutureYouPhotoEligible(18)).toBe(true);
    expect(isFutureYouPhotoEligible(17)).toBe(false);
  });
});
