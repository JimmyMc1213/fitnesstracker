import { describe, expect, it } from "vitest";

import { shouldCelebrateFutureYouReady } from "./confetti";

describe("shouldCelebrateFutureYouReady", () => {
  it("fires only on transition into ready", () => {
    expect(shouldCelebrateFutureYouReady("generating", "ready")).toBe(true);
    expect(shouldCelebrateFutureYouReady("queued", "ready")).toBe(true);
    expect(shouldCelebrateFutureYouReady("ready", "ready")).toBe(false);
    expect(shouldCelebrateFutureYouReady("ready", "generating")).toBe(false);
    expect(shouldCelebrateFutureYouReady("idle", "ready")).toBe(true);
  });
});
