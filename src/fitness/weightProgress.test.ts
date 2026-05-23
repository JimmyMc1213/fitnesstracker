import { describe, expect, it } from "vitest";

import { deltaColorForSentiment, weightDeltaSentiment } from "./weightProgress";

describe("weightDeltaSentiment", () => {
  it("cut: loss is positive, gain is negative", () => {
    expect(weightDeltaSentiment("cut", -2)).toBe("positive");
    expect(weightDeltaSentiment("cut", 0)).toBe("positive");
    expect(weightDeltaSentiment("cut", 1.5)).toBe("negative");
  });

  it("bulk: gain is positive, loss is negative", () => {
    expect(weightDeltaSentiment("bulk", 3)).toBe("positive");
    expect(weightDeltaSentiment("bulk", 0)).toBe("positive");
    expect(weightDeltaSentiment("bulk", -2)).toBe("negative");
  });

  it("maintain: within 1 lb is neutral, beyond is caution", () => {
    expect(weightDeltaSentiment("maintain", 0.5)).toBe("neutral");
    expect(weightDeltaSentiment("maintain", -1)).toBe("neutral");
    expect(weightDeltaSentiment("maintain", 1.2)).toBe("caution");
    expect(weightDeltaSentiment("maintain", -2)).toBe("caution");
  });
});

describe("deltaColorForSentiment", () => {
  it("maps sentiments to CSS colors", () => {
    expect(deltaColorForSentiment("positive")).toBe("var(--pos)");
    expect(deltaColorForSentiment("negative")).toBe("var(--neg)");
    expect(deltaColorForSentiment("neutral")).toBe("rgba(255,255,255,0.45)");
    expect(deltaColorForSentiment("caution")).toBe("#fbbf24");
  });
});
