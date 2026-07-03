import { describe, expect, it } from "vitest";

import {
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_PACE,
} from "./steps";
import {
  backStepFromFutureYouPhoto,
  isGoalWeightOrPaceStep,
  isMaintainGoal,
  isOnboardingGoalEditNavigationBlocked,
  isOnboardingIntoGoalLockNavigationBlocked,
  isOnboardingPastGoalEditZone,
  nextStepAfterGoal,
  resolveGoalLockedOnboardingStep,
  resolveMaintainOnboardingStep,
  resolveOnboardingStepOnRestore,
} from "./routing";

describe("onboardingRouting", () => {
  it("identifies maintain goal and goal weight / pace steps", () => {
    expect(isMaintainGoal("maintain")).toBe(true);
    expect(isMaintainGoal("cut")).toBe(false);
    expect(isGoalWeightOrPaceStep(9)).toBe(true);
    expect(isGoalWeightOrPaceStep(ONBOARDING_STEP_PACE)).toBe(true);
    expect(isGoalWeightOrPaceStep(8)).toBe(false);
    expect(isGoalWeightOrPaceStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(false);
  });

  it("routes maintain from step 8 to Future You photo (10b), not activity", () => {
    expect(nextStepAfterGoal("maintain")).toBe(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
    expect(nextStepAfterGoal("maintain")).not.toBe(11);
  });

  it("routes cut and bulk from step 8 to goal weight (9)", () => {
    expect(nextStepAfterGoal("cut")).toBe(9);
    expect(nextStepAfterGoal("bulk")).toBe(9);
  });

  it("returns maintain users from 10b back to step 8", () => {
    expect(backStepFromFutureYouPhoto("maintain")).toBe(8);
  });

  it("returns cut/bulk users from 10b back to pace (10)", () => {
    expect(backStepFromFutureYouPhoto("cut")).toBe(ONBOARDING_STEP_PACE);
    expect(backStepFromFutureYouPhoto("bulk")).toBe(ONBOARDING_STEP_PACE);
  });

  it("redirects maintain users away from goal weight and pace steps", () => {
    expect(resolveMaintainOnboardingStep(9, "maintain")).toBe(ONBOARDING_STEP_FUTURE_YOU_PHOTO);
    expect(resolveMaintainOnboardingStep(ONBOARDING_STEP_PACE, "maintain")).toBe(
      ONBOARDING_STEP_FUTURE_YOU_PHOTO,
    );
    expect(resolveMaintainOnboardingStep(11, "maintain")).toBe(11);
    expect(resolveMaintainOnboardingStep(9, "cut")).toBe(9);
  });

  it("redirects stale goal-edit steps when onboardingGoalLocked is set", () => {
    const locked = { onboardingGoalLocked: true as const };
    expect(resolveGoalLockedOnboardingStep(8, locked)).toBe(ONBOARDING_STEP_ACTIVITY);
    expect(resolveGoalLockedOnboardingStep(9, locked)).toBe(ONBOARDING_STEP_ACTIVITY);
    expect(resolveGoalLockedOnboardingStep(ONBOARDING_STEP_PACE, locked)).toBe(ONBOARDING_STEP_ACTIVITY);
    expect(resolveGoalLockedOnboardingStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO, locked)).toBe(
      ONBOARDING_STEP_FUTURE_YOU_PHOTO,
    );
    expect(resolveGoalLockedOnboardingStep(8, undefined)).toBe(8);
  });

  it("combines maintain and goal-lock redirects on draft restore", () => {
    expect(resolveOnboardingStepOnRestore(9, "maintain", { onboardingGoalLocked: true })).toBe(
      ONBOARDING_STEP_FUTURE_YOU_PHOTO,
    );
    expect(resolveOnboardingStepOnRestore(8, "cut", { onboardingGoalLocked: true })).toBe(
      ONBOARDING_STEP_ACTIVITY,
    );
  });

  it("blocks navigation into goal-edit screens from step 11 onward", () => {
    expect(isOnboardingPastGoalEditZone(ONBOARDING_STEP_ACTIVITY)).toBe(true);
    expect(isOnboardingPastGoalEditZone(10)).toBe(false);
    expect(isOnboardingGoalEditNavigationBlocked(15, 8)).toBe(true);
    expect(isOnboardingGoalEditNavigationBlocked(15, 9)).toBe(true);
    expect(isOnboardingGoalEditNavigationBlocked(15, ONBOARDING_STEP_PACE)).toBe(true);
    expect(isOnboardingGoalEditNavigationBlocked(ONBOARDING_STEP_PACE, 8)).toBe(false);
    expect(isOnboardingGoalEditNavigationBlocked(15, 14)).toBe(false);
  });

  it("allows back from Future You photo to goal-edit steps", () => {
    expect(
      isOnboardingGoalEditNavigationBlocked(ONBOARDING_STEP_FUTURE_YOU_PHOTO, ONBOARDING_STEP_PACE),
    ).toBe(false);
    expect(isOnboardingGoalEditNavigationBlocked(ONBOARDING_STEP_FUTURE_YOU_PHOTO, 8)).toBe(false);
  });

  it("allows skippers to navigate to photo steps but not goal-edit screens", () => {
    const skipped = { photoSkipped: true as const };
    expect(isOnboardingIntoGoalLockNavigationBlocked(15, ONBOARDING_STEP_FUTURE_YOU_PHOTO, skipped)).toBe(false);
    expect(isOnboardingIntoGoalLockNavigationBlocked(15, 8, skipped)).toBe(true);
    expect(isOnboardingIntoGoalLockNavigationBlocked(15, ONBOARDING_STEP_FUTURE_YOU_PHOTO)).toBe(true);
  });

  it("allows forward navigation through about-you steps into goal lock (e.g. weight → goal)", () => {
    expect(isOnboardingIntoGoalLockNavigationBlocked(6, 7)).toBe(false);
    expect(isOnboardingIntoGoalLockNavigationBlocked(7, 8)).toBe(false);
    expect(isOnboardingIntoGoalLockNavigationBlocked(8, 9)).toBe(false);
  });
});
