import { describe, expect, it } from "vitest";

import { saveImageToDevice } from "./saveImageToDevice";

describe("saveImageToDevice", () => {
  it("rejects empty urls", async () => {
    const result = await saveImageToDevice("");
    expect(result).toEqual({ ok: false, error: "No image to save." });
  });
});
