import { describe, expect, it } from "vitest";

import {
  isWelcomeCompactLayout,
  welcomeFixedContentHeight,
  welcomePhoneScale,
  WELCOME_PHONE_BASE_HEIGHT,
} from "./welcomeHeroLayout";

describe("welcomeHeroLayout", () => {
  const insets = { top: 47, bottom: 34 };

  it("shrinks the phone mockup on short screens", () => {
    const scale = welcomePhoneScale(390, 667, insets, "hero", "landing");
    expect(scale * WELCOME_PHONE_BASE_HEIGHT).toBeLessThanOrEqual(667 - welcomeFixedContentHeight(insets, "landing") + 1);
  });

  it("allocates more fixed space on the auth phase", () => {
    expect(welcomeFixedContentHeight(insets, "auth")).toBeGreaterThan(welcomeFixedContentHeight(insets, "landing"));
  });

  it("marks compact layouts when the hero budget is tight", () => {
    expect(isWelcomeCompactLayout(667, insets, "landing")).toBe(true);
    expect(isWelcomeCompactLayout(932, insets, "landing")).toBe(false);
  });
});
