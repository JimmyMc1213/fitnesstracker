import { describe, expect, it } from "vitest";

import { estimateCollarboneY, identityFeatherPx } from "./estimateCollarboneY";

describe("estimateCollarboneY", () => {
  it("uses a small band for full-body outdoor portraits", () => {
    expect(estimateCollarboneY(2000, 1000)).toBe(400);
  });

  it("uses a mid band for three-quarter portraits", () => {
    expect(estimateCollarboneY(1536, 1024)).toBe(399);
  });

  it("uses a larger band for mirror selfies", () => {
    expect(estimateCollarboneY(1200, 1000)).toBe(408);
  });

  it("returns a minimum feather size", () => {
    expect(identityFeatherPx(200)).toBe(6);
    expect(identityFeatherPx(2000)).toBe(50);
  });
});
