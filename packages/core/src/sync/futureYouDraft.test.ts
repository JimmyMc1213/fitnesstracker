import { describe, expect, it } from "vitest";

import { futureYouDraftAfterUserDelete } from "./futureYouDraft";

describe("futureYouDraftAfterUserDelete", () => {
  it("clears photo and job fields while keeping goal lock", () => {
    expect(
      futureYouDraftAfterUserDelete({
        photoStoragePath: "users/u/source/x.jpg",
        generationJobId: "job-1",
        generationStatus: "ready",
        onboardingGoalLocked: true,
      }),
    ).toEqual({ onboardingGoalLocked: true });
  });

  it("preserves generationReadyAt so the upload cooldown survives delete", () => {
    expect(
      futureYouDraftAfterUserDelete({
        generationStatus: "ready",
        generationReadyAt: "2026-06-01T12:00:00.000Z",
        onboardingGoalLocked: true,
      }),
    ).toEqual({
      onboardingGoalLocked: true,
      generationReadyAt: "2026-06-01T12:00:00.000Z",
    });
  });

  it("returns an empty draft when nothing should be preserved", () => {
    expect(futureYouDraftAfterUserDelete({ photoUploaded: true })).toEqual({});
  });
});
