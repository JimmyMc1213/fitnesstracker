import type { CSSProperties, ReactNode } from "react";

import type { AppState, NavigateFn } from "@newyouai/types";

export type {
  ActivityLevel,
  AdjustmentEvent,
  AppState,
  AppTheme,
  CompletedWorkoutSession,
  CustomExerciseTemplate,
  DietaryRestriction,
  EquipmentSetup,
  ExercisePersonalBest,
  ExerciseSessionSnapshot,
  ExperienceLevel,
  FitnessStreakSnapshot,
  FoodItem,
  FoodMeasurement,
  FoodSearchErrorResponse,
  FoodSearchResponse,
  FoodSearchResult,
  FoodServing,
  FutureYouDraft,
  FutureYouJobStatus,
  GoalPace,
  Habit,
  HabitAction,
  HabitTemplate,
  HabitType,
  HeightDisplayUnit,
  LoggedFood,
  MacroTotals,
  NavigateFn,
  NavigateOptions,
  NotificationPreferences,
  NutritionGoal,
  NutritionLoggedItem,
  NutritionMeal,
  NutritionMealItem,
  NutritionPreset,
  NutritionUserFood,
  OnboardingBarrier,
  OnboardingDraft,
  OnboardingProfile,
  PendingTemplateOrderUpdatePrompt,
  ProgressGoalConfig,
  ProgressPicEntry,
  ProgressPicsLockConfig,
  ReferralSource,
  SessionLength,
  StreakLossNotice,
  StreakSessionBaseline,
  SubscriptionTier,
  SundayCheckInWeekRecord,
  TabId,
  TrainingSessionDuration,
  TrainingStyle,
  UnitPreferences,
  UserGender,
  VolumeUnit,
  WaterLogEntry,
  WeekFocusCommitment,
  WeightEntry,
  WeightUnit,
  WorkoutDaysPerWeek,
  WorkoutExercise,
  WorkoutRoutineTemplate,
  WorkoutSessionPhase,
  WorkoutSessionSummary,
  WorkoutSet,
  WorkoutSetKind,
  WorkoutState,
  WorkoutSummaryNeedsWork,
  WorkoutSummaryPr,
} from "@newyouai/types";

export { FUTURE_YOU_JOB_STATUSES } from "@newyouai/types";

/** PWA screen contract — React-specific; stays in apps/pwa until RN ports use native props. */
export type ScreenProps = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  navigate: NavigateFn;
  /** Incremented by FitnessApp when coach/home routes to Log Food on Nutrition tab. */
  logFoodOpenRequest?: number;
  /** Called after a log-food open request is consumed so revisiting Nutrition does not re-open. */
  onLogFoodOpenRequestHandled?: () => void;
  /** Nutrition tab reports Log Food overlay open state so the main tab bar can hide. */
  onLogFoodOpenChange?: (open: boolean) => void;
  /** Workout tab reports routine editor open state so the main tab bar can hide. */
  onRoutineEditorOpenChange?: (open: boolean) => void;
  /** Progress tab reports progress-pics gallery page open so the main tab bar can hide. */
  onProgressGalleryOpenChange?: (open: boolean) => void;
  /** Incremented when Home tab is tapped while already active — dismiss home overlays. */
  homeReselectRequest?: number;
  onHomeReselectHandled?: () => void;
  /** Incremented when Home should open the mobility preview sheet. */
  mobilityPreviewRequest?: number;
  onMobilityPreviewRequestHandled?: () => void;
  /** Incremented when routing should open NewYou photo upload on the NewYou tab. */
  futureYouUploadRequest?: number;
  onFutureYouUploadRequestHandled?: () => void;
  /** Home reports mobility session overlay open state so the main tab bar can hide. */
  onMobilitySessionOpenChange?: (open: boolean) => void;
  /** Sunday weekly check-in card + flow (Home only). */
  sundayCheckIn?: {
    available: boolean;
    completed: boolean;
    data: import("./sundayCheckIn").SundayCheckInData | null;
    onOpenFlow: () => void;
  };
};

export type IconProps = {
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
