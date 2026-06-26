import { describe, expect, it } from "vitest";

import {
  futureYouDraftAfterPreviewDelete,
  futureYouDraftAfterUserDelete,
  normalizeFutureYouDraft,
  unionFutureYouPreviews,
} from "./futureYouDraft";

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

describe("normalizeFutureYouDraft previews", () => {
  it("keeps valid previews and drops invalid / duplicate entries", () => {
    const draft = normalizeFutureYouDraft({
      generationJobId: "active",
      generationStatus: "ready",
      previews: [
        { jobId: "old-1", readyAt: "2026-05-01T00:00:00.000Z", motivationId: "lean" },
        { jobId: "old-1", readyAt: "dupe" },
        { jobId: "  " },
        { notAJob: true },
        "nope",
      ],
    });
    expect(draft?.previews).toEqual([
      { jobId: "old-1", readyAt: "2026-05-01T00:00:00.000Z", motivationId: "lean" },
    ]);
  });

  it("omits previews when none are valid", () => {
    const draft = normalizeFutureYouDraft({ generationJobId: "active", previews: [] });
    expect(draft?.previews).toBeUndefined();
  });
});

describe("unionFutureYouPreviews", () => {
  it("merges lists de-duplicated by jobId with first occurrence winning", () => {
    expect(
      unionFutureYouPreviews(
        [{ jobId: "a", motivationId: "first" }],
        [{ jobId: "a", motivationId: "second" }, { jobId: "b" }],
      ),
    ).toEqual([{ jobId: "a", motivationId: "first" }, { jobId: "b" }]);
  });

  it("returns undefined when there is nothing to merge", () => {
    expect(unionFutureYouPreviews(undefined, [])).toBeUndefined();
  });
});

describe("futureYouDraftAfterPreviewDelete", () => {
  it("removes an older preview without touching the active job", () => {
    const next = futureYouDraftAfterPreviewDelete(
      {
        generationJobId: "active",
        generationStatus: "ready",
        previews: [{ jobId: "old-1" }, { jobId: "old-2" }],
      },
      "old-1",
    );
    expect(next.generationJobId).toBe("active");
    expect(next.previews).toEqual([{ jobId: "old-2" }]);
  });

  it("promotes the newest kept preview when the active job is deleted", () => {
    const next = futureYouDraftAfterPreviewDelete(
      {
        generationJobId: "active",
        generationStatus: "ready",
        generationReadyAt: "2026-06-10T00:00:00.000Z",
        photoAiConsentAt: "2026-06-01T00:00:00.000Z",
        previews: [
          { jobId: "old-1", readyAt: "2026-05-20T00:00:00.000Z", motivationId: "lean" },
          { jobId: "old-2", readyAt: "2026-05-01T00:00:00.000Z" },
        ],
      },
      "active",
    );
    expect(next.generationJobId).toBe("old-1");
    expect(next.generationStatus).toBe("ready");
    expect(next.generationReadyAt).toBe("2026-05-20T00:00:00.000Z");
    expect(next.motivationId).toBe("lean");
    expect(next.photoAiConsentAt).toBe("2026-06-01T00:00:00.000Z");
    expect(next.previews).toEqual([{ jobId: "old-2", readyAt: "2026-05-01T00:00:00.000Z" }]);
  });

  it("clears media but keeps the cooldown when deleting the only preview", () => {
    const next = futureYouDraftAfterPreviewDelete(
      {
        generationJobId: "active",
        generationStatus: "ready",
        generationReadyAt: "2026-06-10T00:00:00.000Z",
        onboardingGoalLocked: true,
      },
      "active",
    );
    expect(next).toEqual({
      onboardingGoalLocked: true,
      generationReadyAt: "2026-06-10T00:00:00.000Z",
    });
  });
});
