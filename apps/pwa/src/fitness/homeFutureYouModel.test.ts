import { describe, expect, it } from "vitest";

import { futureYouDraftAfterUserDelete } from "./futureYouDraft";
import {
  getHomeFutureYouEntryMode,
  homeFutureYouCardSubtitle,
  homeFutureYouMotivationLabel,
} from "./homeFutureYouModel";

const readyJob = {
  generationJobId: "550e8400-e29b-41d4-a716-446655440000",
  generationStatus: "ready" as const,
};

describe("homeFutureYouModel", () => {
  it("shows reveal entry after subscribe with a ready Future You job", () => {
    expect(getHomeFutureYouEntryMode(readyJob, false, false, "pro", true)).toBe("reveal");
  });

  it("shows upload prompt for skip-photo users after subscribe", () => {
    expect(getHomeFutureYouEntryMode({ photoSkipped: true }, false, false, "pro", true)).toBe(
      "upload_prompt",
    );
  });

  it("shows upload prompt for under-18 after subscribe", () => {
    expect(getHomeFutureYouEntryMode({}, true, false, "pro", true)).toBe("upload_prompt");
  });

  it("hides entry for region-blocked users", () => {
    expect(getHomeFutureYouEntryMode(readyJob, false, true, "pro", true)).toBeNull();
  });

  it("hides entry before onboarding completes or without pro tier", () => {
    expect(getHomeFutureYouEntryMode(readyJob, false, false, "pro", false)).toBeNull();
    expect(getHomeFutureYouEntryMode(undefined, false, false, "free", true)).toBeNull();
    expect(getHomeFutureYouEntryMode(undefined, false, false, null, true)).toBeNull();
  });

  it("shows upload prompt for subscribed users without saved future you", () => {
    expect(getHomeFutureYouEntryMode(undefined, false, false, "pro", true)).toBe("upload_prompt");
  });

  it("shows reveal when future you data exists even if tier flag is missing", () => {
    expect(getHomeFutureYouEntryMode(readyJob, false, false, null, true)).toBe("reveal");
  });

  it("formats card subtitle with timeline and motivation", () => {
    expect(homeFutureYouCardSubtitle("reveal", "3 months", "cut_generic_best")).toBe(
      "3 months · Look my best",
    );
    expect(homeFutureYouCardSubtitle("upload_prompt", "3 months", undefined)).toContain("Add a photo");
  });

  it("resolves motivation labels from curated ids", () => {
    expect(homeFutureYouMotivationLabel("cut_generic_best")).toBe("Look my best");
    expect(homeFutureYouMotivationLabel(undefined)).toBeNull();
  });

  it("shows upload prompt after the user deletes a ready Future You", () => {
    const cleared = futureYouDraftAfterUserDelete({
      ...readyJob,
      onboardingGoalLocked: true,
    });
    expect(getHomeFutureYouEntryMode(cleared, false, false, "pro", true)).toBe("upload_prompt");
    expect(getHomeFutureYouEntryMode(undefined, false, false, "pro", true)).toBe("upload_prompt");
  });
});
