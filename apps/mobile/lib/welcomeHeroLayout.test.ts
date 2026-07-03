import { describe, expect, it } from "vitest";

import {
  isWelcomeCompactLayout,
  welcomeFixedContentHeight,
  welcomePhoneBaseHeight,
  welcomePhoneScale,
} from "./welcomeHeroLayout";

describe("welcomeHeroLayout", () => {
  const insets = { top: 47, bottom: 34 };

  it("shrinks the phone mockup on short screens", () => {
    const options = { phase: "landing" as const, compact: true };
    const scale = welcomePhoneScale(390, 667, insets, "hero", options);
    expect(scale * welcomePhoneBaseHeight(true)).toBeLessThanOrEqual(
      667 - welcomeFixedContentHeight(insets, options) + 1,
    );
  });

  it("allocates more fixed space on the auth phase", () => {
    expect(welcomeFixedContentHeight(insets, { phase: "auth" })).toBeGreaterThan(
      welcomeFixedContentHeight(insets, { phase: "landing" }),
    );
  });

  it("marks compact layouts when the hero budget is tight", () => {
    expect(isWelcomeCompactLayout(667, insets, "landing")).toBe(true);
    expect(isWelcomeCompactLayout(932, insets, "landing")).toBe(false);
  });
});
