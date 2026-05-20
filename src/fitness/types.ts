import type { CSSProperties, ReactNode } from "react";

export type MacroTotals = { cal: number; p: number; c: number; f: number };

/** One manually logged fuel row for a calendar day (Nutrition tab). */
export type NutritionLoggedItem = MacroTotals & {
  id: string;
  /** Optional label (e.g. meal or food name). */
  name: string;
};

/** Reusable template from something you logged before (macros can be all zero). */
export type NutritionPreset = MacroTotals & {
  id: string;
  name: string;
  lastUsedAtMs: number;
  /** Optional coaching / portion notes (e.g. cooked vs raw weight). */
  notes?: string;
};

export type FoodItem = MacroTotals & {
  id: string;
  name: string;
  qty: string;
};

/** One food entry in the day's log (order by `loggedAtMs`, newest first in UI). */
export type LoggedFood = FoodItem & {
  loggedAtMs: number;
};

export type WorkoutSet = { w: number; r: number; done: boolean };

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

/** Saved workout blueprint (editable routines list — like Strong “routines”). */
export type WorkoutRoutineTemplate = {
  id: string;
  name: string;
  /** Short tag, e.g. Mon / Push */
  dayLabel: string;
  /** Subtitle / programming note */
  focus: string;
  exercises: WorkoutExercise[];
  /** Optional session-specific warm-up steps (shown in active workout). */
  warmupItems?: { description: string }[];
  warmupTip?: string;
  /** Closing tip after the main log (e.g. Jimmy plan cues). */
  sessionTip?: string;
};

/** idle: start-workout dashboard; lifting: active session (timer, log) */
export type WorkoutSessionPhase = "idle" | "lifting";

/** Best logged performance per exercise name (keyed by normalized name). */
export type ExercisePersonalBest = { maxWeight: number; maxReps: number };

export type WorkoutSummaryPr = { exerciseName: string; detail: string };

export type WorkoutSummaryNeedsWork = { exerciseName: string; detail: string };

/** Snapshot shown after tapping Finish — not persisted (cleared on dismiss). */
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
};

/** Habit row template (completion lives in `habitsDoneByDay` + today’s `habits` list). */
export type HabitTemplate = {
  id: string;
  name: string;
  icon: string;
  /** Secondary line in the Habits list when present. */
  subtitle?: string;
};

export type Habit = HabitTemplate & {
  done: boolean;
};

export type WeightUnit = "lbs" | "kg";

/** Height entry/display mode — canonical storage is always inches (`heightIn`). */
export type HeightDisplayUnit = "ft_in" | "cm";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentSetup = "full_gym" | "home_gym" | "dumbbells_only" | "bodyweight_only";

export type UnitPreferences = {
  weightUnit: WeightUnit;
  heightUnit: HeightDisplayUnit;
};

export type TabId = "home" | "habits" | "nutrition" | "workout" | "progress" | "stretch";

/** One actionable item for the day — training, fuel, recovery. */
export type DailyTask = {
  id: string;
  title: string;
  category: "gym" | "nutrition" | "life";
  done: boolean;
  navigateTo?: TabId;
};

export type WeightEntry = {
  dateKey: string;
  weightLbs: number;
  photoDataUrl?: string;
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

export type AppState = {
  /** First name for the home greeting */
  displayName: string;
  /** Editable habit checklist (names/icons); order matches Habits tab */
  habitTemplates: HabitTemplate[];
  /** Per calendar day, which habits were marked done */
  habitsDoneByDay: Record<string, Record<string, boolean>>;
  /** Program anchor date (YYYY-MM-DD) for week/day-in-program copy */
  planStartIso: string;
  /** Daily steps target shown in habits + daily plan tasks */
  stepsTarget: number;
  /** @deprecated Reserved for a future in-app food log; not shown in UI. */
  nutritionLog: LoggedFood[];
  /** Per local calendar day, macros entered manually (e.g. from another tracking app). Used only when `nutritionItemsByDay` has no rows for that day. */
  nutritionManualByDay: Record<string, MacroTotals>;
  /** Per local calendar day, individual fuel rows; when non-empty, totals are the sum of these rows. */
  nutritionItemsByDay: Record<string, NutritionLoggedItem[]>;
  /** Saved labels + macros for quick re-add from the Nutrition “Saved” tab. */
  nutritionPresets: NutritionPreset[];
  workout: WorkoutState;
  /** Exercises you created (name + label); available when adding moves to a session. */
  customExercises: CustomExerciseTemplate[];
  /** Freeform notes keyed by exercise identity (name + optional label); persist across all workouts. */
  exerciseNotesByKey: Record<string, string>;
  /** Your routines (start workout from these; edit anytime). Seeded from the built-in 5-day split on first launch. */
  workoutTemplates: WorkoutRoutineTemplate[];
  /** Local YYYY-MM-DD days where the user tapped Finish on a workout session (not Cancel). */
  workoutsCompletedByDay: Record<string, boolean>;
  /** Per-exercise bests for PR detection across sessions. */
  exercisePersonalBests: Record<string, ExercisePersonalBest>;
  /** Post-finish recap overlay; cleared when user returns home. */
  workoutSummary: WorkoutSessionSummary | null;
  habits: Habit[];
  dailyTasks: DailyTask[];
  nutritionTargets: MacroTotals;
  weightLog: WeightEntry[];
  /** Last Sunday you applied an approved fuel change. */
  lastAdjustmentSundayKey: string | null;
  /** Last Sunday you finished the review flow (approve or skip) — blocks the sheet until next week. */
  sundayReviewCompletedKey: string | null;
  adjustmentHistory: AdjustmentEvent[];
  /** Phoenix calendar date (YYYY-MM-DD) when nightly stretch was marked done. */
  nightlyStretchCompletedArizonaKey: string | null;
  /** Per Arizona calendar day, stretch block ids marked complete (`stretchRoutine` ids). */
  nightlyStretchBlockIdsByArizonaDay: Record<string, string[]>;
  progressGoal: ProgressGoalConfig | null;
  /** Display units for weight and height (canonical values stay lbs / inches). */
  unitPreferences: UnitPreferences;
  /** False until user completes the first-run unit preference screen. */
  unitPreferencesChosen: boolean;
  /** Training experience for template generation and coaching cues. */
  experienceLevel: ExperienceLevel;
  /** False until user completes the experience level onboarding screen. */
  experienceLevelChosen: boolean;
  /** Available equipment for exercise selection in templates. */
  equipmentSetup: EquipmentSetup;
  /** False until user completes the equipment onboarding screen. */
  equipmentSetupChosen: boolean;
};

export type ScreenProps = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: (tab: TabId) => void;
};

export type IconProps = {
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
