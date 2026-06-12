import type { MacroTotals } from "./macros";

/** Standalone progress photo in the Progress gallery (not tied to a weigh-in). */
export type ProgressPicEntry = {
  id: string;
  dateKey: string;
  photoDataUrl: string;
  addedAtIso: string;
};

/** Hashed 4-digit PIN for optional progress-pic gallery lock. */
export type ProgressPicsLockConfig = {
  pinHash: string;
};

export type WeightEntry = {
  dateKey: string;
  weightLbs: number;
  /** ISO timestamp when the entry was saved (synced via JSONB payload). */
  loggedAtIso?: string;
  photoDataUrl?: string;
  /** Coach macro guidance captured at save time (survives refresh without recomputing). */
  macroNudge?: { deltaCal: number; reason: string };
  /** Coach reaction message captured at save time. */
  coachMessage?: string;
};

/** Pinned from Sunday check-in — shown on Home for the active week. */
export type WeekFocusCommitment = {
  id: string;
  title: string;
  subtitle: string;
};

/** Compact snapshot saved when a Sunday check-in is completed — lifetime recap archive. */
export type SundayCheckInWeekRecord = {
  sundayKey: string;
  weekStartKey: string;
  weekNumber: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  proteinDaysHit: number;
  weighInsThisWeek: number;
  weightDeltaLbs: number | null;
  weightEndLbs: number | null;
  onTrack: boolean;
  /** Short recap copy for Progress archive. */
  headline: string;
  summary: string;
  weightInsight: string;
  /** Up to 4 win lines. */
  wins: string[];
  /** Up to 3 watch lines. */
  watch: string[];
  /** Pinned commitment titles (compact). */
  commitments: string[];
  /** 7-char day grid: b=both, w=workout, p=protein, .=neither. */
  dayFlags: string;
};

export type AdjustmentEvent = {
  atIso: string;
  weekEndingSunday: string;
  weeklyLossLbs: number;
  before: MacroTotals;
  after: MacroTotals;
  reason: string;
  recommendedDeltaCal?: number;
  appliedDeltaCal?: number;
};

/** Weight goal band + progress bar anchor (persisted). When absent, Progress uses built-in defaults. */
export type ProgressGoalConfig = {
  goalWeightLowLbs: number;
  goalWeightHighLbs: number;
  /** Typical starting weight for “% to goal” bar when the log is empty. */
  progressStartWeightLbs: number;
};

/** Cached streak count synced via Supabase JSONB (recomputed from eligibility map). */
export type FitnessStreakSnapshot = {
  currentCount: number;
  /** Last local date key included in the streak chain. */
  anchorDateKey: string | null;
  updatedAtIso: string;
};

/** Last known active streak count (used to detect a broken chain). */
export type StreakSessionBaseline = {
  count: number;
  dateKey: string;
};

export type StreakLossNotice = {
  lostCount: number;
  breakDateKey: string;
};

export type WaterLogEntry = {
  id: string;
  /** Fluid ounces, canonical storage unit */
  amountOz: number;
  loggedAtMs: number;
};
