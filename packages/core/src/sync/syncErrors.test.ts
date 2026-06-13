import { describe, expect, it } from "vitest";

import { formatSyncedLabel, userFacingSyncError } from "./syncErrors";

describe("syncErrors", () => {
  it("maps SyntaxError to friendly copy", () => {
    expect(userFacingSyncError(new SyntaxError("bad json"), "fallback")).toBe(
      "Saved data could not be read. Using your local defaults.",
    );
  });

  it("formats synced label", () => {
    const label = formatSyncedLabel(Date.UTC(2026, 5, 13, 14, 30));
    expect(label).toBeTruthy();
  });

  it("returns null for null timestamp", () => {
    expect(formatSyncedLabel(null)).toBeNull();
  });
});
