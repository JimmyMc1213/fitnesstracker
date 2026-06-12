import type { AppTheme } from "./app-theme";
import type { FutureYouDraft } from "./future-you";
import type { Habit, HabitTemplate } from "./habits";
import type { MacroTotals } from "./macros";
import type { NotificationPreferences } from "./notifications";
import type { LoggedFood, NutritionLoggedItem, NutritionMeal, NutritionPreset, NutritionUserFood } from "./nutrition";
import type {
  EquipmentSetup,
  ExperienceLevel,
  OnboardingDraft,
  OnboardingProfile,
  SubscriptionTier,
} from "./onboarding";
import type {
  AdjustmentEvent,
  FitnessStreakSnapshot,
  ProgressGoalConfig,
  ProgressPicEntry,
  ProgressPicsLockConfig,
  StreakSessionBaseline,
  SundayCheckInWeekRecord,
  WaterLogEntry,
  WeekFocusCommitment,
  WeightEntry,
} from "./progress";
import type { UnitPreferences } from "./units";
import type {
  CompletedWorkoutSession,
  CustomExerciseTemplate,
  ExercisePersonalBest,
  ExerciseSessionSnapshot,
  PendingTemplateOrderUpdatePrompt,
  WorkoutRoutineTemplate,
  WorkoutSessionSummary,
  WorkoutState,
} from "./workout";

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
  /** Your routines (start workout from these; edit anytime). */
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
  /** Ask to save reordered exercises to the source template; cleared on dismiss or apply. */
  pendingTemplateOrderUpdatePrompt: PendingTemplateOrderUpdatePrompt | null;
  habits: Habit[];
  nutritionTargets: MacroTotals;
  weightLog: WeightEntry[];
  /** Progress tab photo gallery (JPEG data URLs). */
  progressPics: ProgressPicEntry[];
  /** Optional client-side lock for the progress-pic gallery. */
  progressPicsLock: ProgressPicsLockConfig | null;
  /** Last Sunday you applied an approved fuel change. */
  lastAdjustmentSundayKey: string | null;
  /** Last Sunday you finished the review flow (approve or skip), blocks the sheet until next week. */
  sundayReviewCompletedKey: string | null;
  /** Pinned focus items from the most recent Sunday check-in. */
  weekFocusCommitments: WeekFocusCommitment[];
  /** Mon–Sun week start key the focus items belong to. */
  weekFocusWeekStartKey: string | null;
  /** Completed Sunday check-in snapshots, oldest → newest. */
  sundayCheckInHistory: SundayCheckInWeekRecord[];
  adjustmentHistory: AdjustmentEvent[];
  /** Phoenix calendar date (YYYY-MM-DD) when mobility routine was marked done. */
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
  /** App appearance theme. */
  theme: AppTheme;
  /** Tier chosen on paywall; null until onboarding paywall (FTI-74). */
  subscriptionTier: SubscriptionTier | null;
  /** Saved Future You photo path, motivation, and generation job (post-onboarding). */
  futureYou?: FutureYouDraft;
  /** Workout + nutrition reminder toggles, times, and last-fired dedupe keys. */
  notificationPreferences: NotificationPreferences;
  /** Per local calendar day, timestamped water intake entries. */
  waterLogByDay: Record<string, WaterLogEntry[]>;
  /** Daily hydration target in fluid ounces. */
  waterDailyTargetOz: number;
};
