import { describe, expect, it } from "vitest";

import { futureYouDeleteCooldownNotice } from "./deleteModel";
import { FUTURE_YOU_REDO_INTERVAL_MS } from "./pageModel";

describe("futureYouDeleteModel", () => {
  it("describes remaining cooldown days when delete happens before redo is eligible", () => {
    const msRemaining = FUTURE_YOU_REDO_INTERVAL_MS - 7 * 24 * 60 * 60 * 1000;
    expect(futureYouDeleteCooldownNotice(msRemaining)).toBe(
      "The upload cooldown does not reset when you delete. You will need to wait 7 days before you can upload again.",
    );
  });

  it("omits cooldown copy when redo is already available", () => {
    expect(futureYouDeleteCooldownNotice(0)).toBeNull();
  });
});
