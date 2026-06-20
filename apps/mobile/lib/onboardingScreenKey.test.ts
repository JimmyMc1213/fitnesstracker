import { describe, expect, it } from "vitest";

import { onboardingScreenKey, parseOnboardingScreenKey } from "./onboardingScreenKey";

describe("onboardingScreenKey", () => {
  it("maps reinforcement sub-steps to distinct transition keys", () => {
    expect(
      onboardingScreenKey(9, { goalWeightReinforcement: true, scheduleReinforcement: false }),
    ).toBe("9-reinforcement");
    expect(
      onboardingScreenKey(15, { goalWeightReinforcement: false, scheduleReinforcement: true }),
    ).toBe("15-reinforcement");
    expect(
      onboardingScreenKey(15, { goalWeightReinforcement: false, scheduleReinforcement: false }),
    ).toBe("15");
  });

  it("round-trips screen keys for stack transitions", () => {
    const keys = ["9", "9-reinforcement", "15", "15-reinforcement", "16", "100", "101"];
    for (const key of keys) {
      const parsed = parseOnboardingScreenKey(key);
      expect(
        onboardingScreenKey(parsed.step, {
          goalWeightReinforcement: parsed.goalWeightReinforcement,
          scheduleReinforcement: parsed.scheduleReinforcement,
        }),
      ).toBe(key === "100" ? "10b-photo" : key === "101" ? "10c-motivation" : key);
    }
  });
});
