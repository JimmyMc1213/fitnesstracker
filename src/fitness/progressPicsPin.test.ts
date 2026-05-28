import { describe, expect, it } from "vitest";

import { hashProgressPicsPin, isValidProgressPicsPin, verifyProgressPicsPin } from "./progressPicsPin";

describe("progressPicsPin", () => {
  it("accepts only 4-digit pins", () => {
    expect(isValidProgressPicsPin("1234")).toBe(true);
    expect(isValidProgressPicsPin("123")).toBe(false);
    expect(isValidProgressPicsPin("12345")).toBe(false);
    expect(isValidProgressPicsPin("12a4")).toBe(false);
  });

  it("verifies a hashed pin", () => {
    const hash = hashProgressPicsPin("4821");
    expect(verifyProgressPicsPin("4821", hash)).toBe(true);
    expect(verifyProgressPicsPin("0000", hash)).toBe(false);
  });
});
