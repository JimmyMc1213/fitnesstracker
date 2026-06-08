import { describe, expect, it, vi } from "vitest";

import { futureYouDraftAfterUserDelete } from "./futureYouDraft";
import { deleteFutureYou } from "./futureYouDeleteService";

describe("deleteFutureYou", () => {
  it("logs locally in preview mode without calling Supabase", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await deleteFutureYou({ previewMode: true });

    expect(result.removedObjects).toBe(0);
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it("rejects when the user is not signed in or Supabase is unavailable", async () => {
    await expect(deleteFutureYou()).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof Error &&
        error.name === "FutureYouDeleteError" &&
        "code" in error &&
        (error.code === "unavailable" || error.code === "auth_required"),
    );
  });
});

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
