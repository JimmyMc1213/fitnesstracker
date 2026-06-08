import { describe, expect, it } from "vitest";

import { buildFutureYouGalleryItem, formatFutureYouGalleryDate, shouldShowFutureYouGalleryTile } from "./futureYouGalleryModel";

describe("futureYouGalleryModel", () => {
  it("formats ready dates for gallery tiles", () => {
    const label = formatFutureYouGalleryDate("2026-03-15T12:00:00.000Z");
    expect(label).toMatch(/2026/);
  });

  it("builds a gallery item when a job exists", () => {
    const item = buildFutureYouGalleryItem({
      jobId: "550e8400-e29b-41d4-a716-446655440000",
      imageSrc: "https://example.com/preview.png",
      timeline: "3 months",
      motivationLabel: "Look my best",
      readyAtIso: "2026-03-15T12:00:00.000Z",
      loading: false,
    });
    expect(item?.caption).toContain("3 months");
    expect(item?.imageSrc).toContain("preview.png");
  });

  it("shows a tile for reveal and in-progress jobs", () => {
    expect(shouldShowFutureYouGalleryTile("reveal", "ready")).toBe(true);
    expect(shouldShowFutureYouGalleryTile("upload_prompt", "generating")).toBe(true);
    expect(shouldShowFutureYouGalleryTile("upload_prompt", "idle")).toBe(false);
  });
});
