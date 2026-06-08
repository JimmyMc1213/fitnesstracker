import { describe, expect, it } from "vitest";

import {
  macrosEqual,
  shouldConfirmMacroEditOnContinue,
  shouldConfirmOnboardingMacroEdit,
} from "./onboardingMacroEdit";

const futureYouJob = {
  generationJobId: "job-1",
  generationStatus: "generating" as const,
};

describe("onboardingMacroEdit", () => {
  describe("shouldConfirmOnboardingMacroEdit", () => {
    it("warns when Future You is queued, generating, or ready", () => {
      expect(shouldConfirmOnboardingMacroEdit(futureYouJob, "generating")).toBe(true);
      expect(shouldConfirmOnboardingMacroEdit(futureYouJob, "queued")).toBe(true);
      expect(
        shouldConfirmOnboardingMacroEdit(
          { ...futureYouJob, generationStatus: "ready" },
          "ready",
        ),
      ).toBe(true);
      expect(
        shouldConfirmOnboardingMacroEdit(
          { ...futureYouJob, generationStatus: "generating" },
          "idle",
        ),
      ).toBe(true);
    });

    it("does not warn when photo skipped, no job, idle, or failed", () => {
      expect(shouldConfirmOnboardingMacroEdit(undefined, "generating")).toBe(false);
      expect(shouldConfirmOnboardingMacroEdit({ photoSkipped: true, generationJobId: "job-1" }, "generating")).toBe(
        false,
      );
      expect(shouldConfirmOnboardingMacroEdit({ generationStatus: "generating" }, "generating")).toBe(false);
      expect(shouldConfirmOnboardingMacroEdit(futureYouJob, "idle")).toBe(true);
      expect(
        shouldConfirmOnboardingMacroEdit(
          { ...futureYouJob, generationStatus: "failed" },
          "failed",
        ),
      ).toBe(false);
    });

    it("prefers polled status over draft status", () => {
      expect(
        shouldConfirmOnboardingMacroEdit(
          { ...futureYouJob, generationStatus: "generating" },
          "ready",
        ),
      ).toBe(true);
      expect(
        shouldConfirmOnboardingMacroEdit(
          { ...futureYouJob, generationStatus: "ready" },
          "generating",
        ),
      ).toBe(true);
    });
  });

  describe("shouldConfirmMacroEditOnContinue", () => {
    const computed = { cal: 2000, p: 150, c: 200, f: 60 };
    const edited = { cal: 2100, p: 160, c: 200, f: 60 };

    it("warns on continue when macros changed and Future You exists", () => {
      expect(shouldConfirmMacroEditOnContinue(edited, computed, futureYouJob, "generating")).toBe(true);
      expect(
        shouldConfirmMacroEditOnContinue(
          edited,
          computed,
          { ...futureYouJob, generationStatus: "ready" },
          "ready",
        ),
      ).toBe(true);
    });

    it("does not warn when macros unchanged or Future You path inactive", () => {
      expect(shouldConfirmMacroEditOnContinue(computed, computed, futureYouJob, "generating")).toBe(false);
      expect(shouldConfirmMacroEditOnContinue(edited, computed, { photoSkipped: true }, "generating")).toBe(false);
      expect(shouldConfirmMacroEditOnContinue(edited, computed, undefined, "generating")).toBe(false);
    });
  });

  describe("macrosEqual", () => {
    it("compares all macro fields", () => {
      const base = { cal: 2000, p: 150, c: 200, f: 60 };
      expect(macrosEqual(base, { ...base })).toBe(true);
      expect(macrosEqual(base, { ...base, cal: 2100 })).toBe(false);
      expect(macrosEqual(base, { ...base, p: 151 })).toBe(false);
    });
  });
});
