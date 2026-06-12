import { describe, expect, it } from "vitest";

import { FUTURE_YOU_JOB_STATUSES } from "./future-you";

describe("FUTURE_YOU_JOB_STATUSES", () => {
  it("lists all Postgres pipeline states", () => {
    expect(FUTURE_YOU_JOB_STATUSES).toEqual([
      "queued",
      "generating",
      "ready",
      "failed",
    ]);
  });
});
