import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE,
  isFutureYouRegionBlocked,
  isRegionAllowed,
} from "./allowedRegion";

describe("isRegionAllowed", () => {
  it("allows any US state", () => {
    expect(isRegionAllowed("US", "CA")).toBe(true);
    expect(isRegionAllowed("US", "NY")).toBe(true);
  });

  it("allows Canadian provinces except Quebec", () => {
    expect(isRegionAllowed("CA", "ON")).toBe(true);
    expect(isRegionAllowed("CA", "BC")).toBe(true);
    expect(isRegionAllowed("CA", "QC")).toBe(false);
  });

  it("rejects missing or unknown regions", () => {
    expect(isRegionAllowed("US", undefined)).toBe(false);
    expect(isRegionAllowed("CA", "")).toBe(false);
    expect(isRegionAllowed("US", "XX")).toBe(false);
    expect(isRegionAllowed("MX", "JAL")).toBe(false);
  });
});

describe("isFutureYouRegionBlocked", () => {
  it("blocks missing residency and Quebec", () => {
    expect(isFutureYouRegionBlocked(undefined)).toBe(true);
    expect(isFutureYouRegionBlocked({ residencyCountry: "US" })).toBe(true);
    expect(
      isFutureYouRegionBlocked({ residencyCountry: "CA", residencyRegion: "QC" }),
    ).toBe(true);
  });

  it("allows valid US and Canadian residency", () => {
    expect(
      isFutureYouRegionBlocked({ residencyCountry: "US", residencyRegion: "TX" }),
    ).toBe(false);
    expect(
      isFutureYouRegionBlocked({ residencyCountry: "CA", residencyRegion: "ON" }),
    ).toBe(false);
  });
});

describe("FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE", () => {
  it("is stable copy for blocked onboarding", () => {
    expect(FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE).toContain("isn't available");
  });
});
