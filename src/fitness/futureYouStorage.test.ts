import { describe, expect, it } from "vitest";
import {
  FUTURE_YOU_BUCKET,
  futureYouUserPrefix,
  isFutureYouPathOwnedByUser,
} from "./futureYouStorage";

describe("futureYouStorage", () => {
  const userId = "11111111-1111-4111-8111-111111111111";
  const otherId = "22222222-2222-4222-8222-222222222222";

  it("uses private future-you bucket id", () => {
    expect(FUTURE_YOU_BUCKET).toBe("future-you");
  });

  it("builds user path prefix", () => {
    expect(futureYouUserPrefix(userId)).toBe(`users/${userId}/`);
  });

  it("accepts paths under the user prefix", () => {
    expect(isFutureYouPathOwnedByUser(`users/${userId}/source.jpg`, userId)).toBe(true);
    expect(isFutureYouPathOwnedByUser(`users/${userId}/jobs/abc/result.png`, userId)).toBe(true);
  });

  it("rejects another user's paths", () => {
    expect(isFutureYouPathOwnedByUser(`users/${otherId}/source.jpg`, userId)).toBe(false);
    expect(isFutureYouPathOwnedByUser("users/not-a-uuid/source.jpg", userId)).toBe(false);
    expect(isFutureYouPathOwnedByUser("public/source.jpg", userId)).toBe(false);
  });
});
