export type WorkoutSetKind = "working" | "warmup" | "dropset" | "failure";

export type WorkoutSet = { w: number; r: number; done: boolean; kind?: WorkoutSetKind };

export type WorkoutExercise = {
  id: string;
  name: string;
  /** Optional tag (e.g. body part, movement type) from custom exercises. */
  label?: string;
  target: string;
  sets: WorkoutSet[];
};

/** User-defined exercise saved in the workout tab for quick reuse. */
export type CustomExerciseTemplate = {
  id: string;
  name: string;
  label: string;
};

/** Saved workout blueprint (editable routines list, like Strong “routines”). */
export type WorkoutRoutineTemplate = {
  id: string;
  name: string;
  /** Short tag, e.g. Mon / Push */
  dayLabel: string;
  /** Subtitle / programming note */
  focus: string;
  /** Engine-estimated session length in minutes (onboarding / plan builder). */
  estimatedMinutes?: number;
  exercises: WorkoutExercise[];
  /** Optional session-specific warm-up steps (shown in active workout). */
  warmupItems?: { description: string }[];
  warmupTip?: string;
  /** Closing tip after the main log. */
  sessionTip?: string;
};

/** idle: start-workout dashboard; lifting: active session (timer, log) */
export type WorkoutSessionPhase = "idle" | "lifting";

/** Best logged performance per exercise name (keyed by normalized name). */
export type ExercisePersonalBest = { maxWeight: number; maxReps: number };

export type ExerciseSessionSnapshot = {
  dayKey: string;
  endedAtMs: number;
  bestWeight: number;
  bestReps: number;
  volume: number;
};

export type WorkoutSummaryPr = { exerciseName: string; detail: string };

export type WorkoutSummaryNeedsWork = { exerciseName: string; detail: string };

/** Full completed workout stored for history and calendar (persisted + Supabase blob). */
export type CompletedWorkoutSession = {
  id: string;
  dayKey: string;
  endedAtMs: number;
  startedAtMs: number;
  title: string;
  durationSec: number;
  exercises: WorkoutExercise[];
};

/** Ephemeral prompt after finish when session exercise order differed from the template. */
export type PendingTemplateOrderUpdatePrompt = {
  templateId: string;
  templateName: string;
  exerciseOrderKeys: string[];
};

/** Snapshot shown after tapping Finish, not persisted (cleared on dismiss). */
export type WorkoutSessionSummary = {
  title: string;
  durationSec: number;
  doneSets: number;
  totalSets: number;
  totalVolume: number;
  prs: WorkoutSummaryPr[];
  needsWork: WorkoutSummaryNeedsWork[];
};

export type WorkoutState = {
  splitId: string;
  startedAt: string;
  /** Local calendar day (YYYY-MM-DD) when the user started a session; cleared when idle. */
  sessionDayKey: string | null;
  sessionPhase: WorkoutSessionPhase;
  /** Shown in the active session header (editable). */
  sessionTitle: string;
  /** Monotonic clock ms when the active session started; null when idle. */
  sessionStartedAtMs: number | null;
  exercises: WorkoutExercise[];
  /** Rule-based coach notes generated at session start; cleared when session ends. */
  sessionCoachNotesByExerciseId?: Record<string, string>;
  /** Template exercise order at session start; used to detect reorder on finish. */
  sessionBaselineExerciseOrder?: string[];
};
