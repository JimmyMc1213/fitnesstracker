import { describe, expect, it } from "vitest";

import { isFutureYouPhotoBlocked, isFutureYouPhotoEligible } from "./futureYouAge";
import { normalizeFutureYouDraft, canRevisitFutureYouPhoto } from "./futureYouDraft";
import {
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_PACE,
  clampOnboardingStepIndex,
  isOnboardingBackIntoGoalLockBlocked,
  isOnboardingBackLocked,
  isOnboardingGoalEditStep,
  isOnboardingGoalLockStep,
  onboardingProgressStep,
} from "./onboardingSteps";
import { FutureYouUploadError, uploadFutureYouPhoto } from "./futureYouUploadService";

describe("futureYouAge", () => {
  it("blocks ages 13–17 with blurred UI on step 10b", () => {
    expect(isFutureYouPhotoBlocked(13)).toBe(true);
    expect(isFutureYouPhotoBlocked(17)).toBe(true);
    expect(isFutureYouPhotoBlocked(18)).toBe(false);
    expect(isFutureYouPhotoBlocked(12)).toBe(false);
  });

  it("allows upload for 18+", () => {
    expect(isFutureYouPhotoEligible(18)).toBe(true);
    expect(isFutureYouPhotoEligible(17)).toBe(false);
  });
});

describe("onboardingSteps", () => {
  it("maps Future You steps into the progress bar", () => {
    expect(onboardingProgressStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(11);
    expect(onboardingProgressStep(ONBOARDING_STEP_FUTURE_YOU_MOTIVATION)).toBe(12);
    expect(onboardingProgressStep(ONBOARDING_STEP_ACTIVITY)).toBe(13);
  });

  it("preserves special step indices when clamping", () => {
    expect(clampOnboardingStepIndex(ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
    expect(clampOnboardingStepIndex(99)).toBe(27);
  });

  it("identifies goal and Future You steps as the back-navigation lock zone", () => {
    expect(isOnboardingGoalLockStep(8)).toBe(true);
    expect(isOnboardingGoalLockStep(9)).toBe(true);
    expect(isOnboardingGoalLockStep(ONBOARDING_STEP_PACE)).toBe(true);
    expect(isOnboardingGoalLockStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(true);
    expect(isOnboardingGoalLockStep(ONBOARDING_STEP_FUTURE_YOU_MOTIVATION)).toBe(true);
    expect(isOnboardingGoalLockStep(7)).toBe(false);
    expect(isOnboardingGoalLockStep(ONBOARDING_STEP_ACTIVITY)).toBe(false);
    expect(isOnboardingGoalLockStep(15)).toBe(false);
  });

  it("identifies goal-edit steps (8, 9, 10) separately from the full lock zone", () => {
    expect(isOnboardingGoalEditStep(8)).toBe(true);
    expect(isOnboardingGoalEditStep(9)).toBe(true);
    expect(isOnboardingGoalEditStep(ONBOARDING_STEP_PACE)).toBe(true);
    expect(isOnboardingGoalEditStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(false);
    expect(isOnboardingGoalEditStep(ONBOARDING_STEP_ACTIVITY)).toBe(false);
  });

  it("locks back navigation on step 11 only when Future You was not skipped", () => {
    expect(isOnboardingBackLocked(ONBOARDING_STEP_ACTIVITY)).toBe(true);
    expect(isOnboardingBackLocked(ONBOARDING_STEP_ACTIVITY, { photoSkipped: true })).toBe(false);
    expect(isOnboardingBackLocked(ONBOARDING_STEP_ACTIVITY, { photoSkipped: true, photoStoragePath: "x" })).toBe(
      true,
    );
    expect(isOnboardingBackLocked(12)).toBe(false);
    expect(isOnboardingBackLocked(15)).toBe(false);
  });

  it("allows back within the goal lock zone but blocks re-entry from later steps", () => {
    expect(isOnboardingBackIntoGoalLockBlocked(9, 8)).toBe(false);
    expect(isOnboardingBackIntoGoalLockBlocked(ONBOARDING_STEP_PACE, 9)).toBe(false);
    expect(isOnboardingBackIntoGoalLockBlocked(12, ONBOARDING_STEP_PACE)).toBe(true);
    expect(isOnboardingBackIntoGoalLockBlocked(15, 9)).toBe(true);
  });

  it("allows skippers to return to Future You photo steps from step 11+", () => {
    const skipped = { photoSkipped: true as const };
    expect(isOnboardingBackIntoGoalLockBlocked(12, ONBOARDING_STEP_FUTURE_YOU_PHOTO, skipped)).toBe(false);
    expect(isOnboardingBackIntoGoalLockBlocked(15, ONBOARDING_STEP_FUTURE_YOU_MOTIVATION, skipped)).toBe(false);
    expect(isOnboardingBackIntoGoalLockBlocked(15, 9, skipped)).toBe(true);
    expect(isOnboardingBackIntoGoalLockBlocked(12, ONBOARDING_STEP_PACE, skipped)).toBe(true);
  });
});

describe("futureYouDraft", () => {
  it("detects when a skipper may revisit photo upload", () => {
    expect(canRevisitFutureYouPhoto({ photoSkipped: true })).toBe(true);
    expect(canRevisitFutureYouPhoto({ photoSkipped: true, photoStoragePath: "users/a.jpg" })).toBe(false);
    expect(canRevisitFutureYouPhoto({ photoSkipped: true, generationJobId: "job-1" })).toBe(false);
    expect(canRevisitFutureYouPhoto(undefined)).toBe(false);
  });

  it("normalizes persisted futureYou fields", () => {
    expect(
      normalizeFutureYouDraft({
        photoSkipped: true,
        remindersMuted: true,
        reminderDismissedDateKey: "2026-06-04",
        photoAiConsentAt: "2026-05-29T12:00:00.000Z",
        photoStoragePath: " users/u1/source/a.jpg ",
        generationStatus: "queued",
        onboardingGoalLocked: true,
      }),
    ).toEqual({
      photoSkipped: true,
      remindersMuted: true,
      reminderDismissedDateKey: "2026-06-04",
      photoAiConsentAt: "2026-05-29T12:00:00.000Z",
      photoStoragePath: "users/u1/source/a.jpg",
      generationStatus: "queued",
      onboardingGoalLocked: true,
    });
  });
});

describe("uploadFutureYouPhoto", () => {
  it("rejects when the user is not signed in or Supabase is unavailable", async () => {
    await expect(uploadFutureYouPhoto("data:image/jpeg;base64,abc")).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof FutureYouUploadError &&
        (error.code === "unavailable" || error.code === "auth_required"),
    );
  });
});
