import { describe, expect, it } from "vitest";

import { arizonaCalendarDateKey, formatDateKeyEyebrow, localDateKey } from "./dailyPlan";

describe("localDateKey", () => {
  it("formats YYYY-MM-DD in local time", () => {
    expect(localDateKey(new Date(2026, 4, 22))).toBe("2026-05-22");
  });
});

describe("formatDateKeyEyebrow", () => {
  it("returns uppercase weekday month day", () => {
    expect(formatDateKeyEyebrow("2026-05-22")).toMatch(/FRI MAY 22/);
  });
});

describe("arizonaCalendarDateKey", () => {
  it("returns en-CA formatted date", () => {
    expect(arizonaCalendarDateKey(new Date("2026-05-22T18:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
