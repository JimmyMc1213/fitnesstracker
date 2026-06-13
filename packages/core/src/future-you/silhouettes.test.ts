import { describe, expect, it } from "vitest";

import { futureYouSilhouetteGenderKey } from "./silhouettes";

describe("futureYouSilhouetteGenderKey", () => {
  it("returns female key for female and other", () => {
    expect(futureYouSilhouetteGenderKey("female")).toBe("female");
    expect(futureYouSilhouetteGenderKey("other")).toBe("female");
    expect(futureYouSilhouetteGenderKey(undefined)).toBe("female");
  });

  it("returns male key for male", () => {
    expect(futureYouSilhouetteGenderKey("male")).toBe("male");
  });
});
