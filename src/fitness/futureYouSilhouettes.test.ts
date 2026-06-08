import { describe, expect, it } from "vitest";

import { futureYouSilhouettesForGender } from "./futureYouSilhouettes";

describe("futureYouSilhouettesForGender", () => {
  it("returns female silhouettes for female and other", () => {
    expect(futureYouSilhouettesForGender("female")?.before).toContain("female");
    expect(futureYouSilhouettesForGender("other")?.after).toContain("female");
  });

  it("returns male silhouettes for male", () => {
    expect(futureYouSilhouettesForGender("male")?.before).toContain("male");
    expect(futureYouSilhouettesForGender("male")?.after).toContain("male");
  });
});
