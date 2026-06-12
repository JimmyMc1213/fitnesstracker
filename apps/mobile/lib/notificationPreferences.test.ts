import { describe, expect, it } from "vitest";

import { anyNotificationEnabled, ONBOARDING_NOTIFICATION_DEFAULTS } from "./notificationPreferences";

describe("anyNotificationEnabled", () => {
  it("returns false when all toggles are off", () => {
    expect(anyNotificationEnabled(ONBOARDING_NOTIFICATION_DEFAULTS)).toBe(false);
  });

  it("returns true when any toggle is on", () => {
    expect(
      anyNotificationEnabled({
        ...ONBOARDING_NOTIFICATION_DEFAULTS,
        workoutReminderEnabled: true,
      }),
    ).toBe(true);
  });
});
