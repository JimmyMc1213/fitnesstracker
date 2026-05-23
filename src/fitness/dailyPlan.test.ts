import { describe, expect, it } from "vitest";

import { DEFAULT_NUTRITION_TARGETS } from "./data";
import {
  arizonaCalendarDateKey,
  formatDailyPlanSubtitle,
  formatDateKeyEyebrow,
  generateDailyTasksForDate,
  isArizonaEightPmOrLater,
  localDateKey,
} from "./dailyPlan";

describe("localDateKey", () => {
  it("formats YYYY-MM-DD from local Date parts", () => {
    expect(localDateKey(new Date(2026, 4, 22))).toBe("2026-05-22");
  });
});

describe("formatDateKeyEyebrow", () => {
  it("returns uppercase weekday and month pattern", () => {
    const eyebrow = formatDateKeyEyebrow("2026-05-22");
    expect(eyebrow).toContain("FRI");
    expect(eyebrow).toContain("MAY");
  });
});

describe("arizonaCalendarDateKey", () => {
  it("maps UTC instant to Phoenix calendar day", () => {
    // 2026-05-23T06:59:00Z = 2026-05-22 23:59 America/Phoenix (UTC-7, no DST)
    expect(arizonaCalendarDateKey(new Date("2026-05-23T06:59:00Z"))).toBe("2026-05-22");
    // 2026-05-23T07:00:00Z = 2026-05-23 00:00 Phoenix
    expect(arizonaCalendarDateKey(new Date("2026-05-23T07:00:00Z"))).toBe("2026-05-23");
  });
});

describe("isArizonaEightPmOrLater", () => {
  it("returns false before 20:00 Phoenix", () => {
    // 2026-05-23T02:59:00Z = 2026-05-22 19:59 Phoenix
    expect(isArizonaEightPmOrLater(new Date("2026-05-23T02:59:00Z"))).toBe(false);
  });

  it("returns true at or after 20:00 Phoenix", () => {
    // 2026-05-23T03:00:00Z = 2026-05-22 20:00 Phoenix
    expect(isArizonaEightPmOrLater(new Date("2026-05-23T03:00:00Z"))).toBe(true);
  });
});

describe("formatDailyPlanSubtitle", () => {
  it("returns short weekday and date label", () => {
    const subtitle = formatDailyPlanSubtitle(new Date(2026, 4, 20));
    expect(subtitle).toMatch(/Wed/i);
    expect(subtitle).toMatch(/May/i);
    expect(subtitle).toMatch(/20/);
  });
});

describe("generateDailyTasksForDate", () => {
  const targets = DEFAULT_NUTRITION_TARGETS;

  it("generates weekday training tasks with workout navigation and deterministic ids", () => {
    const wednesday = new Date(2026, 4, 20);
    const dateKey = localDateKey(wednesday);
    const tasks = generateDailyTasksForDate(wednesday, targets);

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.id.startsWith(`${dateKey}_`))).toBe(true);

    const gymTasks = tasks.filter((t) => t.category === "gym");
    expect(gymTasks.some((t) => t.navigateTo === "workout")).toBe(true);
    expect(gymTasks[0]?.title).toMatch(/Wed/i);

    expect(tasks.some((t) => t.category === "nutrition")).toBe(true);
    expect(tasks.some((t) => t.category === "life")).toBe(true);
  });

  it("generates Saturday active-recovery tasks without workout navigation on first gym task", () => {
    const saturday = new Date(2026, 4, 23);
    const dateKey = localDateKey(saturday);
    const tasks = generateDailyTasksForDate(saturday, targets);

    const firstGym = tasks.find((t) => t.category === "gym");
    expect(firstGym?.title).toMatch(/Saturday/i);
    expect(firstGym?.title).toMatch(/Active recovery/i);
    expect(firstGym?.navigateTo).toBeUndefined();
    expect(tasks.every((t) => t.id.startsWith(`${dateKey}_`))).toBe(true);
  });

  it("generates Sunday rest and check-in life tasks", () => {
    const sunday = new Date(2026, 4, 24);
    const dateKey = localDateKey(sunday);
    const tasks = generateDailyTasksForDate(sunday, targets);

    const firstGym = tasks.find((t) => t.category === "gym");
    expect(firstGym?.title).toMatch(/Sunday/i);
    expect(firstGym?.title).toMatch(/Rest/i);

    const lifeTasks = tasks.filter((t) => t.category === "life");
    expect(lifeTasks.some((t) => t.title.includes("Sunday check-in"))).toBe(true);
    expect(lifeTasks.some((t) => t.title.includes("weekly fuel review"))).toBe(true);
    expect(tasks.every((t) => t.id.startsWith(`${dateKey}_`))).toBe(true);
  });
});
