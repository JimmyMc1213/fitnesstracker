import { describe, expect, it } from "vitest";

import {
  deltaColorForSentiment,
  MAINTAIN_WEIGHT_BAND_LBS,
  WEIGHT_DELTA_CAUTION_COLOR,
  WEIGHT_DELTA_NEG_COLOR,
  WEIGHT_DELTA_POS_COLOR,
  weightDeltaSentiment,
} from "./weightProgress";

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

  it(`maintain: within ±${MAINTAIN_WEIGHT_BAND_LBS} lb is positive, beyond is caution`, () => {
    expect(weightDeltaSentiment("maintain", 0.5)).toBe("positive");
    expect(weightDeltaSentiment("maintain", -2)).toBe("positive");
    expect(weightDeltaSentiment("maintain", 2)).toBe("positive");
    expect(weightDeltaSentiment("maintain", 2.1)).toBe("caution");
    expect(weightDeltaSentiment("maintain", -2.1)).toBe("caution");
  });
});

describe("deltaColorForSentiment", () => {
  it("maps sentiments to goal-aware colors", () => {
    expect(deltaColorForSentiment("positive")).toBe(WEIGHT_DELTA_POS_COLOR);
    expect(deltaColorForSentiment("negative")).toBe(WEIGHT_DELTA_NEG_COLOR);
    expect(deltaColorForSentiment("neutral")).toBe("var(--text-ghost)");
    expect(deltaColorForSentiment("caution")).toBe(WEIGHT_DELTA_CAUTION_COLOR);
  });
});
