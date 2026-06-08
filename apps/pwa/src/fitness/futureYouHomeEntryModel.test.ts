import { describe, expect, it } from "vitest";

import {
  hasNotUsedNewYou,
  shouldShowFutureYouSkipperReminderPill,
  shouldShowHomeNewYouHeaderButton,
} from "./futureYouHomeEntryModel";

const base = {
  mode: "upload_prompt" as const,
  photoBlocked: false,
  onboardingComplete: true,
  futureYou: { photoSkipped: true },
  todayDateKey: "2026-06-04",
};

describe("futureYouHomeEntryModel", () => {
  it("detects users who have not used NewYou", () => {
    expect(hasNotUsedNewYou("upload_prompt", false)).toBe(true);
    expect(hasNotUsedNewYou("reveal", false)).toBe(false);
    expect(hasNotUsedNewYou("upload_prompt", true)).toBe(false);
  });

  it("shows header button when onboarding done and NewYou unused", () => {
    expect(shouldShowHomeNewYouHeaderButton(base)).toBe(true);
    expect(shouldShowHomeNewYouHeaderButton({ ...base, onboardingComplete: false })).toBe(false);
    expect(shouldShowHomeNewYouHeaderButton({ ...base, mode: "reveal" })).toBe(false);
  });

  it("hides pill when muted, dismissed today, or media exists", () => {
    expect(shouldShowFutureYouSkipperReminderPill(base)).toBe(true);
    expect(
      shouldShowFutureYouSkipperReminderPill({
        ...base,
        futureYou: { photoSkipped: true, remindersMuted: true },
      }),
    ).toBe(false);
    expect(
      shouldShowFutureYouSkipperReminderPill({
        ...base,
        futureYou: { photoSkipped: true, reminderDismissedDateKey: "2026-06-04" },
      }),
    ).toBe(false);
    expect(
      shouldShowFutureYouSkipperReminderPill({
        ...base,
        futureYou: { photoSkipped: true, photoStoragePath: "users/a.jpg" },
      }),
    ).toBe(false);
    expect(
      shouldShowFutureYouSkipperReminderPill({
        ...base,
        futureYou: { photoSkipped: true, generationStatus: "ready" },
      }),
    ).toBe(false);
  });
});
