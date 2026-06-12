import { describe, expect, it } from "vitest";

import {
  macrosEqual,
  shouldConfirmMacroEditOnContinue,
  shouldConfirmOnboardingMacroEdit,
} from "@/lib/onboardingMacroEdit";

describe("onboardingMacroEdit", () => {
  const computed = { cal: 2200, p: 180, c: 200, f: 70 };
  const edited = { cal: 2000, p: 180, c: 200, f: 70 };
  const futureYouJob = {
    generationJobId: "job-1",
    generationStatus: "generating" as const,
  };

  it("detects macro equality", () => {
    expect(macrosEqual(computed, { ...computed })).toBe(true);
    expect(macrosEqual(computed, edited)).toBe(false);
  });

  it("requires confirm when macros edited during active Future You job", () => {
    expect(shouldConfirmOnboardingMacroEdit(futureYouJob, "generating")).toBe(true);
    expect(shouldConfirmMacroEditOnContinue(edited, computed, futureYouJob, "generating")).toBe(true);
  });

  it("skips confirm when macros unchanged or photo skipped", () => {
    expect(shouldConfirmMacroEditOnContinue(computed, computed, futureYouJob, "generating")).toBe(false);
    expect(shouldConfirmMacroEditOnContinue(edited, computed, { photoSkipped: true }, "generating")).toBe(false);
  });
});
