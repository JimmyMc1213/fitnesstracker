import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_FAILURE_SYSTEM_LEAD,
  FUTURE_YOU_FAILURE_TIPS_INTRO,
  futureYouFailureCopy,
} from "./failureModel";
import { FUTURE_YOU_GENERATION_REFUSED_ERROR } from "./generationPillModel";
import { FUTURE_YOU_JOB_STALE_ERROR } from "./staleJob";

describe("futureYouFailureCopy", () => {
  it("shows photo tips for content refusal and unknown errors", () => {
    expect(futureYouFailureCopy(FUTURE_YOU_GENERATION_REFUSED_ERROR)).toEqual({
      lead: FUTURE_YOU_FAILURE_TIPS_INTRO,
      showTips: true,
    });
    expect(futureYouFailureCopy(undefined)).toEqual({
      lead: FUTURE_YOU_FAILURE_TIPS_INTRO,
      showTips: true,
    });
    expect(futureYouFailureCopy("some other error")).toEqual({
      lead: FUTURE_YOU_FAILURE_TIPS_INTRO,
      showTips: true,
    });
  });

  it("shows system lead for transient errors without tips", () => {
    expect(futureYouFailureCopy("not_found")).toEqual({
      lead: FUTURE_YOU_FAILURE_SYSTEM_LEAD,
      showTips: false,
    });
    expect(futureYouFailureCopy(FUTURE_YOU_JOB_STALE_ERROR)).toEqual({
      lead: FUTURE_YOU_FAILURE_SYSTEM_LEAD,
      showTips: false,
    });
    expect(futureYouFailureCopy("Network error — try again later")).toEqual({
      lead: FUTURE_YOU_FAILURE_SYSTEM_LEAD,
      showTips: false,
    });
  });
});
