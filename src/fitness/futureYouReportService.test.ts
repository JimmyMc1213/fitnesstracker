import { describe, expect, it, vi } from "vitest";

import { submitFutureYouReport } from "./futureYouReportService";

describe("submitFutureYouReport", () => {
  it("logs locally in preview mode without calling Supabase", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await submitFutureYouReport(
      {
        jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        context: "home",
        category: "not_accurate",
        message: "Looks nothing like me",
      },
      { previewMode: true },
    );

    expect(result.reportId).toBe("dev-local");
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });

  it("rejects when the user is not signed in or Supabase is unavailable", async () => {
    await expect(
      submitFutureYouReport({
        context: "onboarding_success",
        category: "other",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof Error &&
        error.name === "FutureYouReportError" &&
        "code" in error &&
        (error.code === "unavailable" || error.code === "auth_required"),
    );
  });
});
