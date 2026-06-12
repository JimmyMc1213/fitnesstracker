import type { SundayCheckInWeekRecord } from "@newyouai/types";

/** Keep ~10 years of weekly recaps. */
const MAX_HISTORY_WEEKS = 520;

/** Fill recap fields for legacy or partial records. */
export function coalesceSundayCheckInRecord(record: SundayCheckInWeekRecord): SundayCheckInWeekRecord {
  return {
    ...record,
    headline: record.headline ?? "",
    summary: record.summary ?? "",
    weightInsight: record.weightInsight ?? "",
    wins: Array.isArray(record.wins) ? record.wins : [],
    watch: Array.isArray(record.watch) ? record.watch : [],
    commitments: Array.isArray(record.commitments) ? record.commitments : [],
    dayFlags: typeof record.dayFlags === "string" && /^[bwp.]{7}$/.test(record.dayFlags) ? record.dayFlags : ".......",
    weightEndLbs:
      typeof record.weightEndLbs === "number" && Number.isFinite(record.weightEndLbs) && record.weightEndLbs > 0
        ? record.weightEndLbs
        : null,
  };
}

export function capSundayCheckInHistory(history: SundayCheckInWeekRecord[]): SundayCheckInWeekRecord[] {
  const byWeek = new Map<string, SundayCheckInWeekRecord>();
  for (const record of history) {
    byWeek.set(record.weekStartKey, coalesceSundayCheckInRecord(record));
  }
  return [...byWeek.values()].sort((a, b) => a.weekStartKey.localeCompare(b.weekStartKey)).slice(-MAX_HISTORY_WEEKS);
}

export function mergeSundayCheckInHistory(
  local: SundayCheckInWeekRecord[] | undefined,
  remote: SundayCheckInWeekRecord[] | undefined,
): SundayCheckInWeekRecord[] {
  return capSundayCheckInHistory([...(local ?? []), ...(remote ?? [])]);
}
