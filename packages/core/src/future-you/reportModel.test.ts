import { describe, expect, it } from "vitest";

import { futureYouReportCategoryLabel } from "./reportModel";

describe("futureYouReportModel", () => {
  it("labels report categories for the sheet", () => {
    expect(futureYouReportCategoryLabel("not_accurate")).toBe("Doesn't look like me");
    expect(futureYouReportCategoryLabel("other")).toBe("Something else");
  });
});
