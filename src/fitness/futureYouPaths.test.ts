import { describe, expect, it } from "vitest";

import { buildFutureYouResultPath, isFutureYouSourcePathForUser } from "./futureYouPaths";

describe("futureYouPaths", () => {
  const userId = "11111111-2222-3333-4444-555555555555";

  it("builds result path under user folder", () => {
    expect(buildFutureYouResultPath(userId, "job-abc")).toBe(
      `users/${userId}/result/job-abc.png`,
    );
  });

  it("accepts valid source paths for the owning user", () => {
    const path = `users/${userId}/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg`;
    expect(isFutureYouSourcePathForUser(path, userId)).toBe(true);
  });

  it("rejects source paths for another user", () => {
    const path = "users/other-user/source/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.jpg";
    expect(isFutureYouSourcePathForUser(path, userId)).toBe(false);
  });

  it("rejects malformed source paths", () => {
    expect(isFutureYouSourcePathForUser(`users/${userId}/result/job.png`, userId)).toBe(false);
    expect(isFutureYouSourcePathForUser(`users/${userId}/source/not-a-uuid.jpg`, userId)).toBe(false);
  });
});
