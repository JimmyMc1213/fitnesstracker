import { describe, expect, it } from "vitest";

import { cacheFutureYouPreviewUrl, getCachedFutureYouPreviewUrl } from "./futureYouImagePreload";

describe("futureYouImagePreload", () => {
  it("caches preview URLs by job id", () => {
    const jobId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
    cacheFutureYouPreviewUrl(jobId, "https://example.com/preview.png");
    expect(getCachedFutureYouPreviewUrl(jobId)).toBe("https://example.com/preview.png");
  });
});
