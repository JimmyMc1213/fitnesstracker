import type { SundayCheckInData } from "./sundayCheckIn";
import type { AppState, SundayCheckInWeekRecord, WeekFocusCommitment } from "./types";

/** Keep ~10 years of weekly recaps. */
const MAX_HISTORY_WEEKS = 520;

const MAX_HEADLINE_LEN = 120;
const MAX_SUMMARY_LEN = 200;
const MAX_INSIGHT_LEN = 280;
const MAX_WIN_LEN = 120;
const MAX_WATCH_LEN = 120;
const MAX_COMMITMENT_LEN = 80;

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function clipStrings(items: string[], maxItems: number, maxLen: number): string[] {
  return items
    .map((s) => clip(s, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function compactSundayDayFlags(dayCells: SundayCheckInData["dayCells"]): string {
  return dayCells
    .map((cell) => {
      if (cell.workoutDone && cell.proteinHit) return "b";
      if (cell.workoutDone) return "w";
      if (cell.proteinHit) return "p";
      return ".";
    })
    .join("");
}


function normalizeRecapFields(o: Record<string, unknown>): Pick<
  SundayCheckInWeekRecord,
  "headline" | "summary" | "weightInsight" | "wins" | "watch" | "commitments" | "dayFlags" | "weightEndLbs"
> {
  const headline = typeof o.headline === "string" ? clip(o.headline, MAX_HEADLINE_LEN) : "";
  const summary = typeof o.summary === "string" ? clip(o.summary, MAX_SUMMARY_LEN) : "";
  const weightInsight = typeof o.weightInsight === "string" ? clip(o.weightInsight, MAX_INSIGHT_LEN) : "";
  const wins = clipStrings(Array.isArray(o.wins) ? o.wins.filter((x): x is string => typeof x === "string") : [], 4, MAX_WIN_LEN);
  const watch = clipStrings(Array.isArray(o.watch) ? o.watch.filter((x): x is string => typeof x === "string") : [], 3, MAX_WATCH_LEN);
  const commitments = clipStrings(
    Array.isArray(o.commitments) ? o.commitments.filter((x): x is string => typeof x === "string") : [],
    5,
    MAX_COMMITMENT_LEN,
  );
  const rawFlags = typeof o.dayFlags === "string" ? o.dayFlags : "";
  const dayFlags = /^[bwp.]{7}$/.test(rawFlags) ? rawFlags : ".......";
  const weightEndLbs =
    typeof o.weightEndLbs === "number" && Number.isFinite(o.weightEndLbs) && o.weightEndLbs > 0
      ? o.weightEndLbs
      : null;

  return { headline, summary, weightInsight, wins, watch, commitments, dayFlags, weightEndLbs };
}

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

export function normalizeSundayCheckInHistory(raw: unknown): SundayCheckInWeekRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: SundayCheckInWeekRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const sundayKey = typeof o.sundayKey === "string" ? o.sundayKey : "";
    const weekStartKey = typeof o.weekStartKey === "string" ? o.weekStartKey : "";
    const weekNumber = Number(o.weekNumber);
    const workoutsCompleted = Number(o.workoutsCompleted);
    const workoutsPlanned = Number(o.workoutsPlanned);
    const proteinDaysHit = Number(o.proteinDaysHit);
    const weighInsThisWeek = Number(o.weighInsThisWeek);
    const onTrack = o.onTrack === true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sundayKey) || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartKey)) continue;
    if (!Number.isFinite(weekNumber) || weekNumber < 1) continue;
    out.push({
      sundayKey,
      weekStartKey,
      weekNumber,
      workoutsCompleted: Number.isFinite(workoutsCompleted) ? Math.max(0, workoutsCompleted) : 0,
      workoutsPlanned: Number.isFinite(workoutsPlanned) ? Math.max(0, workoutsPlanned) : 0,
      proteinDaysHit: Number.isFinite(proteinDaysHit) ? Math.max(0, Math.min(7, proteinDaysHit)) : 0,
      weighInsThisWeek: Number.isFinite(weighInsThisWeek) ? Math.max(0, Math.min(7, weighInsThisWeek)) : 0,
      weightDeltaLbs: typeof o.weightDeltaLbs === "number" && Number.isFinite(o.weightDeltaLbs) ? o.weightDeltaLbs : null,
      onTrack,
      ...normalizeRecapFields(o),
    });
  }
  return capSundayCheckInHistory(
    out.sort((a, b) => a.weekStartKey.localeCompare(b.weekStartKey)),
  );
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

export function weekRecordFromCheckInData(
  data: SundayCheckInData,
  commitments: WeekFocusCommitment[] = [],
): SundayCheckInWeekRecord {
  return {
    sundayKey: data.sundayKey,
    weekStartKey: data.weekStartKey,
    weekNumber: data.weekNumber,
    workoutsCompleted: data.workoutsCompleted,
    workoutsPlanned: data.workoutsPlanned,
    proteinDaysHit: data.proteinDaysHit,
    weighInsThisWeek: data.weighInsThisWeek,
    weightDeltaLbs: data.weightDeltaLbs,
    weightEndLbs: data.weightEndLbs,
    onTrack: data.onTrack,
    headline: clip(data.headline, MAX_HEADLINE_LEN),
    summary: clip(data.summaryLine, MAX_SUMMARY_LEN),
    weightInsight: clip(data.weightInsight, MAX_INSIGHT_LEN),
    wins: clipStrings(
      data.wins.map((w) => w.text),
      4,
      MAX_WIN_LEN,
    ),
    watch: clipStrings(
      data.watchItems.map((w) => w.text),
      3,
      MAX_WATCH_LEN,
    ),
    commitments: clipStrings(
      commitments.map((c) => c.title),
      5,
      MAX_COMMITMENT_LEN,
    ),
    dayFlags: compactSundayDayFlags(data.dayCells),
  };
}

export function appendSundayCheckInHistory(
  history: SundayCheckInWeekRecord[],
  record: SundayCheckInWeekRecord,
): SundayCheckInWeekRecord[] {
  return capSundayCheckInHistory([...history.filter((h) => h.weekStartKey !== record.weekStartKey), record]);
}

export function priorSundayCheckInWeek(
  history: SundayCheckInWeekRecord[],
  weekStartKey: string,
): SundayCheckInWeekRecord | null {
  const prior = history
    .filter((h) => h.weekStartKey < weekStartKey)
    .sort((a, b) => b.weekStartKey.localeCompare(a.weekStartKey));
  return prior[0] ?? null;
}

export function onTrackWeekStreak(
  history: SundayCheckInWeekRecord[],
  weekStartKey: string,
  currentOnTrack: boolean,
): number {
  const prior = history
    .filter((h) => h.weekStartKey < weekStartKey)
    .sort((a, b) => b.weekStartKey.localeCompare(a.weekStartKey));

  let streak = currentOnTrack ? 1 : 0;
  for (const week of prior) {
    if (!week.onTrack) break;
    streak += 1;
  }
  return streak;
}

export function planStartWeightLbs(state: AppState): number | null {
  const fromGoal = state.progressGoal?.progressStartWeightLbs;
  if (typeof fromGoal === "number" && Number.isFinite(fromGoal) && fromGoal > 0) return fromGoal;

  const planStart = state.planStartIso;
  const afterPlan = [...state.weightLog]
    .filter((e) => e.dateKey >= planStart)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  if (afterPlan.length > 0) return afterPlan[0].weightLbs;

  const sorted = [...state.weightLog].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return sorted[0]?.weightLbs ?? null;
}

export function buildSundayMultiWeekContext(input: {
  history: SundayCheckInWeekRecord[];
  weekStartKey: string;
  weekNumber: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weightDeltaLbs: number | null;
  onTrack: boolean;
  planStartWeightLbs: number | null;
  currentWeightLbs: number | null;
}): string[] {
  const lines: string[] = [];
  const prior = priorSundayCheckInWeek(input.history, input.weekStartKey);

  if (prior) {
    const workoutDelta = input.workoutsCompleted - prior.workoutsCompleted;
    if (workoutDelta > 0) {
      lines.push(`+${workoutDelta} more workout${workoutDelta === 1 ? "" : "s"} than last week.`);
    } else if (workoutDelta < 0) {
      const n = Math.abs(workoutDelta);
      lines.push(`${n} fewer workout${n === 1 ? "" : "s"} than last week.`);
    }

    const proteinDelta = input.proteinDaysHit - prior.proteinDaysHit;
    if (proteinDelta >= 2) {
      lines.push(`Protein improved: ${prior.proteinDaysHit}/7 → ${input.proteinDaysHit}/7.`);
    } else if (proteinDelta <= -2) {
      lines.push(`Protein dipped: ${prior.proteinDaysHit}/7 → ${input.proteinDaysHit}/7.`);
    }

    if (input.weightDeltaLbs != null && prior.weightDeltaLbs != null) {
      const trendDelta = input.weightDeltaLbs - prior.weightDeltaLbs;
      if (Math.abs(trendDelta) >= 0.4) {
        if (trendDelta < 0) lines.push("Weight trend improved vs last week.");
        else lines.push("Weight trend softened vs last week.");
      }
    }
  }

  const streak = onTrackWeekStreak(input.history, input.weekStartKey, input.onTrack);
  if (streak >= 2) {
    lines.push(`${streak} weeks in a row on track for goal pace.`);
  }

  if (input.planStartWeightLbs != null && input.currentWeightLbs != null && input.weekNumber >= 2) {
    const total = input.currentWeightLbs - input.planStartWeightLbs;
    if (Math.abs(total) >= 0.5) {
      const dir = total < 0 ? "Down" : "Up";
      lines.push(`${dir} ${Math.abs(total).toFixed(1)} lb since week 1.`);
    }
  }

  const completedWeeks = input.history.filter((h) => h.weekStartKey < input.weekStartKey).length;
  if (completedWeeks >= 2) {
    lines.push(`${completedWeeks + 1} weekly check-ins logged. Trends beat one-offs.`);
  }

  return lines.slice(0, 3);
}

export function buildSundayHistoryWins(input: {
  history: SundayCheckInWeekRecord[];
  weekStartKey: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
}): string[] {
  const wins: string[] = [];
  const prior = priorSundayCheckInWeek(input.history, input.weekStartKey);
  if (!prior) return wins;

  if (input.workoutsCompleted >= input.workoutsPlanned && prior.workoutsCompleted < prior.workoutsPlanned) {
    wins.push("Back on track with full training volume.");
  }

  if (input.proteinDaysHit >= 5 && prior.proteinDaysHit < 5) {
    wins.push("Protein rebounded vs last week.");
  }

  if (
    input.workoutsCompleted > prior.workoutsCompleted &&
    input.workoutsCompleted >= input.workoutsPlanned - 1
  ) {
    wins.push("Training consistency improved week over week.");
  }

  return wins.slice(0, 2);
}
