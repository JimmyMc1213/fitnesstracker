import { describe, expect, it } from "vitest";

import {
  FUTURE_YOU_REPORT_MESSAGE_MAX,
  isFutureYouReportCategory,
  isFutureYouReportContext,
  normalizeFutureYouReportMessage,
} from "./futureYouReportGuards";
import { futureYouReportCategoryLabel } from "./futureYouReportModel";

describe("futureYouReportGuards", () => {
  it("accepts known contexts and categories", () => {
    expect(isFutureYouReportContext("onboarding_success")).toBe(true);
    expect(isFutureYouReportContext("home")).toBe(true);
    expect(isFutureYouReportContext("paywall")).toBe(false);

    expect(isFutureYouReportCategory("not_accurate")).toBe(true);
    expect(isFutureYouReportCategory("offensive")).toBe(true);
    expect(isFutureYouReportCategory("bad")).toBe(false);
  });

  it("trims and caps optional report messages", () => {
    expect(normalizeFutureYouReportMessage("  hello  ")).toBe("hello");
    expect(normalizeFutureYouReportMessage("   ")).toBeUndefined();
    expect(normalizeFutureYouReportMessage("x".repeat(FUTURE_YOU_REPORT_MESSAGE_MAX + 20))).toHaveLength(
      FUTURE_YOU_REPORT_MESSAGE_MAX,
    );
  });
});

describe("futureYouReportModel", () => {
  it("labels report categories for the sheet", () => {
    expect(futureYouReportCategoryLabel("not_accurate")).toBe("Doesn't look like me");
    expect(futureYouReportCategoryLabel("other")).toBe("Something else");
  });
});
