import type { FutureYouDraft, MacroTotals } from "@newyouai/types";

import { isFutureYouJobActive, type FutureYouJobStatus } from "@/lib/futureYouJobs";

export function macrosEqual(a: MacroTotals, b: MacroTotals): boolean {
  return a.cal === b.cal && a.p === b.p && a.c === b.c && a.f === b.f;
}

function resolveFutureYouGenerationStatus(
  pollStatus: FutureYouJobStatus | "idle",
  draftStatus: FutureYouJobStatus | "idle" | undefined,
): FutureYouJobStatus | "idle" | undefined {
  return pollStatus !== "idle" ? pollStatus : draftStatus;
}

export function shouldConfirmOnboardingMacroEdit(
  futureYou: FutureYouDraft | undefined,
  pollStatus: FutureYouJobStatus | "idle",
): boolean {
  if (!futureYou || futureYou.photoSkipped) return false;
  if (!futureYou.generationJobId?.trim()) return false;

  const status = resolveFutureYouGenerationStatus(pollStatus, futureYou.generationStatus);
  if (!status || status === "idle" || status === "failed") return false;

  return isFutureYouJobActive(status) || status === "ready";
}

export function shouldConfirmMacroEditOnContinue(
  macros: MacroTotals,
  computedMacros: MacroTotals,
  futureYou: FutureYouDraft | undefined,
  pollStatus: FutureYouJobStatus | "idle",
): boolean {
  return !macrosEqual(macros, computedMacros) && shouldConfirmOnboardingMacroEdit(futureYou, pollStatus);
}
