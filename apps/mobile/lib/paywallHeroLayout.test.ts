import { describe, expect, it } from "vitest";

import { paywallHeroImageBoxSize, paywallHeroLayoutTier } from "./paywallHeroLayout";

describe("paywallHeroLayoutTier", () => {
  it("uses compact on standard iPhone heights (844pt class)", () => {
    const { tier } = paywallHeroLayoutTier(844, 59, 34);
    expect(tier).toBe("compact");
  });

  it("uses regular on tall phones", () => {
    const { tier } = paywallHeroLayoutTier(932, 59, 34);
    expect(tier).toBe("regular");
  });

  it("uses tight on small phones", () => {
    const { tier } = paywallHeroLayoutTier(667, 50, 34);
    expect(tier).toBe("tight");
  });

  it("uses a tighter tier when accessibility text is enlarged", () => {
    const normal = paywallHeroLayoutTier(844, 59, 34, 1);
    const large = paywallHeroLayoutTier(844, 59, 34, 1.35);
    expect(large.tier).not.toBe("regular");
    expect(large.availableHeight).toBeLessThan(normal.availableHeight);
  });
});

describe("paywallHeroImageBoxSize", () => {
  it("caps image height so goal and weight delta fit on compact screens", () => {
    const { availableHeight, tier } = paywallHeroLayoutTier(844, 59, 34);
    expect(tier).toBe("compact");

    const { height } = paywallHeroImageBoxSize(tier, 390, availableHeight);
    expect(height).toBeLessThanOrEqual(availableHeight - 112);
  });
});
