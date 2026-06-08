import type { FutureYouDraft } from "./futureYouDraft";
import { isFutureYouJobActive, type FutureYouJobStatus } from "./futureYouJobs";
import type { MacroTotals } from "./types";

export function macrosEqual(a: MacroTotals, b: MacroTotals): boolean {
  return a.cal === b.cal && a.p === b.p && a.c === b.c && a.f === b.f;
}

function resolveFutureYouGenerationStatus(
  pollStatus: FutureYouJobStatus | "idle",
  draftStatus: FutureYouJobStatus | "idle" | undefined,
): FutureYouJobStatus | "idle" | undefined {
  return pollStatus !== "idle" ? pollStatus : draftStatus;
}

/** True when macro edits can affect an existing or in-progress Future You image. */
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

/** Step 21 Continue should warn when the user changed macros on the Future You path. */
export function shouldConfirmMacroEditOnContinue(
  macros: MacroTotals,
  computedMacros: MacroTotals,
  futureYou: FutureYouDraft | undefined,
  pollStatus: FutureYouJobStatus | "idle",
): boolean {
  return !macrosEqual(macros, computedMacros) && shouldConfirmOnboardingMacroEdit(futureYou, pollStatus);
}
