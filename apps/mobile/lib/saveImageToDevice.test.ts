import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { saveImageToDevice } from "./saveImageToDevice";

describe("saveImageToDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty urls", async () => {
    const result = await saveImageToDevice("");
    expect(result).toEqual({ ok: false, error: "No image to save." });
  });
});
