import { describe, expect, it } from "vitest";

import { getFontScale, isLargeTextEnabled } from "./fontScale";

describe("fontScale", () => {
  it("reports a fixed scale of 1 while typography is locked app-wide", () => {
    expect(getFontScale()).toBe(1);
    expect(isLargeTextEnabled()).toBe(false);
  });
});
