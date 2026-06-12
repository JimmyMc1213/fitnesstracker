import type { PersistedFitnessSlice } from "@newyouai/types";

export function hasExistingFitnessData(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  if (!p) return false;
  return Object.keys(p.workoutsCompletedByDay ?? {}).length > 0 || (p.weightLog?.length ?? 0) > 0;
}
