import type { WeightEntry } from "@newyouai/types";

/** Mean weight for distinct logged days in range; null if fewer than `minDistinctDays`. */
export function meanWeightInRangeOrNull(
  log: WeightEntry[],
  startKey: string,
  endKey: string,
  minDistinctDays = 1,
): number | null {
  const entries = log.filter((e) => e.dateKey >= startKey && e.dateKey <= endKey);
  const byDay = new Map<string, number>();
  for (const e of entries) {
    byDay.set(e.dateKey, e.weightLbs);
  }
  if (byDay.size < minDistinctDays) return null;
  const sum = [...byDay.values()].reduce((a, v) => a + v, 0);
  return sum / byDay.size;
}
