import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_JOB_STALE_MS,
  isFutureYouJobStale,
} from "./staleJob";

describe("isFutureYouJobStale", () => {
  const now = Date.parse("2026-06-24T12:00:00.000Z");

  it("returns false for ready jobs", () => {
    expect(isFutureYouJobStale("2026-06-24T11:00:00.000Z", "ready", now)).toBe(false);
  });

  it("returns false for fresh generating jobs", () => {
    expect(
      isFutureYouJobStale("2026-06-24T11:56:00.000Z", "generating", now),
    ).toBe(false);
  });

  it("returns true for generating jobs older than the stale window", () => {
    const staleAt = new Date(now - FUTURE_YOU_JOB_STALE_MS - 1).toISOString();
    expect(isFutureYouJobStale(staleAt, "generating", now)).toBe(true);
  });
});
