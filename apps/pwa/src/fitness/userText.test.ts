import { describe, expect, it } from "vitest";

import { sanitizeUserText } from "./userText";

describe("sanitizeUserText", () => {
  it("strips partial unicode escapes and trims", () => {
    expect(sanitizeUserText("  hello\\u0041 world  ")).toBe("hello world");
  });

  it("leaves valid text unchanged", () => {
    expect(sanitizeUserText("Jimmy")).toBe("Jimmy");
  });

  it("removes dangling \\u without hex digits", () => {
    expect(sanitizeUserText("bad\\u name")).toBe("bad name");
  });
});
