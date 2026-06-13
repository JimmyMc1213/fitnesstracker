import { describe, expect, it } from "vitest";

import {
  NUTRITION_NOTIFICATION_ID,
  WORKOUT_NOTIFICATION_ID,
  parseReminderTime,
} from "./localNotifications";

describe("localNotifications constants", () => {
  it("uses PWA-parity notification identifiers", () => {
    expect(WORKOUT_NOTIFICATION_ID).toBe("fitcoach-workout");
    expect(NUTRITION_NOTIFICATION_ID).toBe("fitcoach-nutrition");
  });
});

describe("parseReminderTime", () => {
  it("parses HH:mm into hour and minute", () => {
    expect(parseReminderTime("08:30")).toEqual({ hour: 8, minute: 30 });
    expect(parseReminderTime("20:00")).toEqual({ hour: 20, minute: 0 });
  });

  it("normalizes invalid input to fallback midnight", () => {
    expect(parseReminderTime("invalid")).toEqual({ hour: 0, minute: 0 });
  });
});

describe("parseReminderTime edge cases", () => {
  it("handles single-digit hours from normalized prefs", () => {
    expect(parseReminderTime("9:05")).toEqual({ hour: 9, minute: 5 });
  });
});
