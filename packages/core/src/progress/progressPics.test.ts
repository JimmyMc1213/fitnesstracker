import { describe, expect, it } from "vitest";

import {
  collectProgressPicGalleryItems,
  normalizeProgressPics,
  normalizeProgressPicsLock,
  newProgressPicId,
  upsertWeighInProgressPic,
  withProgressPicsDefaults,
} from "./progressPics";

describe("normalizeProgressPics", () => {
  it("filters invalid entries and keeps valid data URLs", () => {
    const raw = [
      { id: "pp-1", dateKey: "2026-06-01", photoDataUrl: "data:image/jpeg;base64,abc", addedAtIso: "2026-06-01T08:00:00.000Z" },
      { id: "", dateKey: "2026-06-02", photoDataUrl: "data:image/jpeg;base64,x" },
      { id: "pp-2", dateKey: "bad", photoDataUrl: "data:image/jpeg;base64,x" },
      { id: "pp-3", dateKey: "2026-06-03", photoDataUrl: "https://example.com/x.jpg" },
    ];
    expect(normalizeProgressPics(raw)).toEqual([
      { id: "pp-1", dateKey: "2026-06-01", photoDataUrl: "data:image/jpeg;base64,abc", addedAtIso: "2026-06-01T08:00:00.000Z" },
    ]);
  });
});

describe("normalizeProgressPicsLock", () => {
  it("accepts pp-prefixed pin hashes only", () => {
    expect(normalizeProgressPicsLock({ pinHash: "pp1234" })).toEqual({ pinHash: "pp1234" });
    expect(normalizeProgressPicsLock({ pinHash: "abcd" })).toBeNull();
    expect(normalizeProgressPicsLock(null)).toBeNull();
  });
});

describe("collectProgressPicGalleryItems", () => {
  it("merges gallery and weigh-in photos sorted newest first", () => {
    const items = collectProgressPicGalleryItems(
      [{ id: "g1", dateKey: "2026-06-01", photoDataUrl: "data:image/jpeg;base64,a", addedAtIso: "2026-06-01T10:00:00.000Z" }],
      [{ dateKey: "2026-06-02", weightLbs: 170, photoDataUrl: "data:image/jpeg;base64,b", loggedAtIso: "2026-06-02T09:00:00.000Z" }],
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.source).toBe("weigh-in");
    expect(items[1]?.source).toBe("gallery");
  });
});

describe("upsertWeighInProgressPic", () => {
  it("replaces same-date pic and removes when photo cleared", () => {
    const existing = [{ id: "old", dateKey: "2026-06-01", photoDataUrl: "data:image/jpeg;base64,old", addedAtIso: "2026-06-01T08:00:00.000Z" }];
    const next = upsertWeighInProgressPic(existing, "2026-06-01", "data:image/jpeg;base64,new");
    expect(next).toHaveLength(1);
    expect(next[0]?.photoDataUrl).toBe("data:image/jpeg;base64,new");
    expect(next[0]?.id).not.toBe("old");
    expect(upsertWeighInProgressPic(next, "2026-06-01", undefined)).toEqual([]);
  });
});

describe("withProgressPicsDefaults", () => {
  it("fills empty arrays when missing", () => {
    expect(withProgressPicsDefaults({})).toEqual({ progressPics: [], progressPicsLock: null });
  });
});

describe("newProgressPicId", () => {
  it("returns unique pp- prefixed ids", () => {
    expect(newProgressPicId()).toMatch(/^pp-/);
    expect(newProgressPicId()).not.toBe(newProgressPicId());
  });
});
