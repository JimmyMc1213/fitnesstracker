import type { CSSProperties, ReactNode } from "react";

export type MacroTotals = { cal: number; p: number; c: number; f: number };

/** One manually logged fuel row for a calendar day (Nutrition tab). */
export type NutritionLoggedItem = MacroTotals & {
  id: string;
  /** Optional label (e.g. meal or food name). */
  name: string;
  /** Human-readable portion (e.g. "1 cup"). */
  servingLabel?: string;
  /** Origin of the row (e.g. manual, catalog). */
  source?: string;
  /** Stable id from an external food database when linked. */
  externalId?: string;
  /** When the row was logged (ms since epoch); used for recency UI. */
  loggedAtMs?: number;
};

/** User-starred food for one-tap re-log (Favorite foods tab). */
export type NutritionPreset = MacroTotals & {
  id: string;
  name: string;
  /** When the user last logged this favorite. */
  lastUsedAtMs: number;
  /** When the user tapped the favorite button; required to appear in Favorite foods. */
  favoritedAtMs: number;
  servingLabel?: string;
  /** Optional coaching / portion notes (e.g. cooked vs raw weight). */
  notes?: string;
};

/** User-owned food library entry (manual or saved from search). */
export type NutritionUserFood = MacroTotals & {
  id: string;
  name: string;
  servingLabel?: string;
  source?: string;
  externalId?: string;
  savedAtMs: number;
  updatedAtMs?: number;
};

/** One ingredient in a saved meal prep recipe. */
export type NutritionMealItem = MacroTotals & {
  id: string;
  name: string;
  servingLabel?: string;
  source?: string;
  externalId?: string;
};

/** Saved meal prep recipe (composite of ingredients). */
export type NutritionMeal = {
  id: string;
  name: string;
  items: NutritionMealItem[];
  createdAtMs: number;
  updatedAtMs?: number;
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

/** Saved workout blueprint (editable routines list, like Strong “routines”). */
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

/** Height entry/display mode, canonical storage is always inches (`heightIn`). */
export type HeightDisplayUnit = "ft_in" | "cm";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type EquipmentSetup = "full_gym" | "home_gym" | "dumbbells_only" | "bodyweight_only";

export type NutritionGoal = "bulk" | "cut" | "maintain";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type UserGender = "male" | "female" | "other";

export type WorkoutDaysPerWeek = 3 | 4 | 5 | 6;

export type GoalPace = "slow" | "balanced" | "aggressive";

export type SubscriptionTier = "free" | "pro";

export type NotificationPreferences = {
  workoutReminderEnabled: boolean;
  workoutReminderTime: string;
  nutritionCheckInEnabled: boolean;
  nutritionCheckInTime: string;
  /** Last local date keys a reminder was shown, prevents duplicate fires per day */
  lastFiredWorkoutReminderDateKey: string | null;
  lastFiredNutritionReminderDateKey: string | null;
};

/** Stats and preferences collected during full onboarding (FTI-14). */
export type OnboardingProfile = {
  goal: NutritionGoal;
  heightIn: number;
  weightLbs: number;
  age: number;
  /** ISO YYYY-MM-DD; when set, age is derived at normalize time. */
  dateOfBirth?: string;
  gender: UserGender;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: WorkoutDaysPerWeek;
  /** Mon–Sun labels aligned to workout templates (backfilled on migrate). */
  trainingWeekdays?: string[];
  /** Target weight for cut/bulk progress bar. */
  goalWeightLbs?: number;
  /** Cut/bulk pace for calorie adjustment. */
  pace?: GoalPace;
};

/** In-progress onboarding wizard state for resume (FTI-70). */
export type OnboardingDraft = {
  version: number;
  stepIndex: number;
  updatedAtIso: string;
  displayName: string;
  unitPreferences: UnitPreferences;
  experienceLevel: ExperienceLevel;
  equipmentSetup: EquipmentSetup;
  profile: OnboardingProfile;
  draftTemplates?: WorkoutRoutineTemplate[];
  macros?: MacroTotals;
  notificationPrefs?: NotificationPreferences;
  subscriptionTier?: SubscriptionTier;
};

export type UnitPreferences = {
  weightUnit: WeightUnit;
  heightUnit: HeightDisplayUnit;
};

export type TabId = "home" | "nutrition" | "workout" | "progress" | "stretch";

/** One actionable item for the day, training, fuel, recovery. */
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
  /** ISO timestamp when the entry was saved (synced via JSONB payload). */
  loggedAtIso?: string;
  photoDataUrl?: string;
  /** Coach macro guidance captured at save time (survives refresh without recomputing). */
  macroNudge?: { deltaCal: number; reason: string };
  /** Coach reaction message captured at save time. */
  coachMessage?: string;
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
  /** My foods library: manual entries and foods saved from search. */
  nutritionUserFoods: NutritionUserFood[];
  /** My meals library: saved meal prep recipes. */
  nutritionMeals: NutritionMeal[];
  workout: WorkoutState;
  /** Exercises you created (name + label); available when adding moves to a session. */
  customExercises: CustomExerciseTemplate[];
  /** Freeform notes keyed by exercise identity (name + optional label); persist across all workouts. */
  exerciseNotesByKey: Record<string, string>;
  /** Your routines (start workout from these; edit anytime). Seeded from the built-in 5-day split on first launch. */
  workoutTemplates: WorkoutRoutineTemplate[];
  /** Local YYYY-MM-DD days where the user tapped Finish on a workout session (not Cancel). */
  workoutsCompletedByDay: Record<string, boolean>;
  /** Days that count toward the fitness streak (workout finish or nutrition goal hit). Synced to Supabase. */
  streakEligibleByDay: Record<string, boolean>;
  /** Denormalized streak count for quick display; recomputed when eligibility changes. */
  fitnessStreakSnapshot: FitnessStreakSnapshot;
  /** Last active streak count before a break (for loss notice). */
  streakSessionBaseline: StreakSessionBaseline | null;
  /** Dismiss streak-loss modal once per break day. */
  streakLossNoticeDismissedForKey: string | null;
  /** Per-exercise bests for PR detection across sessions. */
  exercisePersonalBests: Record<string, ExercisePersonalBest>;
  /** Last 10 session snapshots per exercise (keyed by exerciseNoteKey). */
  exerciseSessionHistoryByKey: Record<string, ExerciseSessionSnapshot[]>;
  /** Completed workouts, newest first (capped on save). */
  workoutHistory: CompletedWorkoutSession[];
  /** Post-finish recap overlay; cleared when user returns home. */
  workoutSummary: WorkoutSessionSummary | null;
  habits: Habit[];
  dailyTasks: DailyTask[];
  nutritionTargets: MacroTotals;
  weightLog: WeightEntry[];
  /** Last Sunday you applied an approved fuel change. */
  lastAdjustmentSundayKey: string | null;
  /** Last Sunday you finished the review flow (approve or skip), blocks the sheet until next week. */
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
  /** Default rest between sets in seconds (global). */
  restTimerDefaultSeconds: number;
  /** Per-exercise rest overrides keyed by exerciseNoteKey. */
  restTimerSecondsByExerciseKey: Record<string, number>;
  /** Profile from full onboarding (goal, stats, activity, split days). */
  onboardingProfile: OnboardingProfile | null;
  /** True after user finishes the guided onboarding wizard. */
  onboardingComplete: boolean;
  /** Mid-flow onboarding snapshot; cleared on finish. */
  onboardingDraft: OnboardingDraft | null;
  /** Tier chosen on paywall; null until onboarding paywall (FTI-74). */
  subscriptionTier: SubscriptionTier | null;
  /** Workout + nutrition reminder toggles, times, and last-fired dedupe keys. */
  notificationPreferences: NotificationPreferences;
  /** Per local calendar day, timestamped water intake entries. */
  waterLogByDay: Record<string, WaterLogEntry[]>;
  /** Daily hydration target in fluid ounces. */
  waterDailyTargetOz: number;
};

export type NavigateOptions = {
  /** When navigating to Nutrition, open the Log Food overlay after tab switch. */
  openLogFood?: boolean;
};

export type NavigateFn = (tab: TabId, options?: NavigateOptions) => void;

export type ScreenProps = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: NavigateFn;
  /** Incremented by FitnessApp when coach/home routes to Log Food on Nutrition tab. */
  logFoodOpenRequest?: number;
  /** Nutrition tab reports Log Food overlay open state so the main tab bar can hide. */
  onLogFoodOpenChange?: (open: boolean) => void;
};

export type IconProps = {
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
