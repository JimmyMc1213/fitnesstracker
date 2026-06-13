import { describe, expect, it } from "vitest";

import { futureYouRevealPlaceholderGenderKey } from "./revealPlaceholder";

describe("futureYouRevealPlaceholderGenderKey", () => {
  it("matches silhouette gender key", () => {
    expect(futureYouRevealPlaceholderGenderKey("male")).toBe("male");
    expect(futureYouRevealPlaceholderGenderKey("female")).toBe("female");
  });
});
