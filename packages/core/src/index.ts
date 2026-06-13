export { mergePersistedFitnessSlices } from "./sync/mergePersistedFitnessSlices";
export { createEmptyPersistedSlice } from "./sync/testFixtures";
export {
  buildOnboardingDraft,
  mergeOnboardingDrafts,
  normalizeOnboardingDraft,
  ONBOARDING_DRAFT_VERSION,
} from "./sync/onboardingDraft";
export type { OnboardingDraftInput } from "./sync/onboardingDraft";
export {
  dedupeHabitTemplates,
  isNutritionProgrammingHabit,
  stripNutritionProgrammingHabits,
} from "./sync/habitsMerge";
export {
  isLegacyDemoWorkoutTemplates,
  LEGACY_DEMO_WORKOUT_IDS,
  normalizeWorkoutExerciseArray,
  normalizeWorkoutTemplates,
  sanitizeWorkoutTemplates,
} from "./sync/workoutTemplates";
export { mergeExerciseSessionHistoryByKey, MAX_SESSION_HISTORY } from "./sync/exerciseSessionHistoryMerge";
export { mergeWorkoutHistory, MAX_WORKOUT_HISTORY, getWorkoutHistorySorted } from "./sync/workoutHistoryMerge";
export { mergeExercisePersonalBests } from "./sync/workoutSummaryMerge";
export {
  DEFAULT_REST_TIMER_SECONDS,
  MAX_REST_TIMER_SECONDS,
  MIN_REST_TIMER_SECONDS,
  mergeRestTimerSecondsByExerciseKey,
  normalizeRestTimerDefaultSeconds,
  normalizeRestTimerSecondsByExerciseKey,
} from "./sync/restTimerPreferences";
export {
  DEFAULT_NOTIFICATION_PREFERENCES,
  mergeNotificationPreferences,
  normalizeNotificationPreferences,
  normalizeTimeHHmm,
} from "./sync/notificationPreferences";
export {
  normalizeFutureYouDraft,
  mergeFutureYouDraft,
  isFutureYouMediaCleared,
  EMPTY_FUTURE_YOU_DRAFT,
} from "./sync/futureYouDraft";
export { nutritionPresetFingerprint } from "./nutrition/nutritionTotals";
export { hasExistingFitnessData } from "./sync/onboardingSkip";
export { normalizeAppTheme } from "./sync/theme";
export { DEFAULT_UNIT_PREFERENCES, normalizeUnitPreferences } from "./sync/unitPreferences";
export {
  DEFAULT_WATER_DAILY_TARGET_OZ,
  mergeWaterLogByDay,
  normalizeWaterDailyTargetOz,
  normalizeWaterLogByDay,
} from "./sync/waterIntake";
export {
  capSundayCheckInHistory,
  coalesceSundayCheckInRecord,
  mergeSundayCheckInHistory,
} from "./sync/sundayCheckInHistoryMerge";
export { DEFAULT_EXPERIENCE_LEVEL, normalizeExperienceLevel } from "./sync/experienceLevel";
export { DEFAULT_EQUIPMENT_SETUP, normalizeEquipmentSetup } from "./sync/equipmentSetup";
export { normalizeWorkoutSetKind } from "./sync/workoutSetKind";
export {
  FITNESS_LOCAL_STORAGE_KEY,
  createLocalStorageAdapter,
  createMemoryStorageAdapter,
  loadPersistedSlice,
  resetSafeJsonParseLogs,
  safeJsonParse,
  savePersistedSlice,
} from "./storage";
export type {
  PersistStorageAdapter,
  PersistStorageAdapterFactory,
  SyncStorageLike,
} from "./storage";
export { canRevisitFutureYouPhoto } from "./onboarding/future-you-routing";
export {
  canReachOnboardingWizard,
  isAppShellLoading,
  needsAuthForApp,
  resolveAppShellMainView,
  type AppShellMainView,
  type AppShellRoutingInput,
} from "./shell/appShellRouting";
export {
  isMaintainGoal,
  isGoalWeightOrPaceStep,
  nextStepAfterGoal,
  backStepFromFutureYouPhoto,
  resolveMaintainOnboardingStep,
  isOnboardingPastGoalEditZone,
  resolveGoalLockedOnboardingStep,
  resolveOnboardingStepOnRestore,
  isOnboardingGoalEditNavigationBlocked,
  isOnboardingIntoGoalLockNavigationBlocked,
} from "./onboarding/routing";
export {
  ONBOARDING_STEP_PACE,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_PAYWALL,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  isFutureYouOnboardingStep,
  isOnboardingGoalEditStep,
  isOnboardingGoalLockStep,
  clampOnboardingStepIndex,
} from "./onboarding/steps";
export {
  localDateKey,
  formatDateKeyEyebrow,
  arizonaCalendarDateKey,
  formatDailyPlanSubtitle,
} from "./dates/dailyPlan";
export { planWeekIndex } from "./plan/planWeekIndex";
export {
  ZERO_MACROS,
  manualTotalsForDateKey,
  sumNutritionItems,
  effectiveNutritionTotalsForDateKey,
} from "./nutrition/nutritionTotals";
export {
  NUTRITION_GOAL_HIT_RATIO,
  nutritionGoalHitForDateKey,
  dayEligibleForStreak,
  rebuildStreakEligibleByDay,
  computeFitnessStreakCount,
  computeFitnessCheckInStreak,
  streakMotivationLabel,
  normalizeStreakEligibleByDay,
  normalizeFitnessStreakSnapshot,
  normalizeStreakSessionBaseline,
  buildFitnessStreakSnapshot,
  applyStreakEligibility,
} from "./streak/dailyStreak";
export {
  startOfWeekMonday,
  weekDateKeysMondayStart,
  buildWeeklySummary,
  formatWeeklySummaryRange,
  type WeeklySummary,
} from "./training/weeklySummary";
export {
  defaultTrainingWeekdays,
  weekdayShort,
  weekdayFullName,
  weekdayMonStartIndex,
  nextTrainingDayFrom,
  resolveWorkoutDaysPerWeek,
  normalizeDayLabel,
  isTrainingDay,
  templateForDate,
  startOfWeekSunday,
  weekDateKeysSundayStart,
} from "./training/trainingCalendar";
export {
  parseWorkoutTarget,
  parseRepRangeBounds,
  getExerciseRepBounds,
  describeRepRangeBounds,
  describeExerciseRepRange,
  type ParsedWorkoutTarget,
} from "./workout/workoutTarget";
export {
  AVG_WORK_SECONDS_PER_SET,
  EXERCISE_TRANSITION_SECONDS,
  SESSION_WARMUP_BUFFER_SECONDS,
  estimateSessionSecondsFromCounts,
  estimateRoutineSessionSeconds,
  formatEstimatedSessionMinutes,
  estimatedSessionLabel,
} from "./workout/estimateSessionDuration";
export { progressiveOverloadInsight } from "./coach/progressiveOverload";
export { homePlanSubline } from "./coach/homePlanSubline";
export {
  greetingFirstName,
  homeGreetingTitle,
  timeOfDayBucket,
  type TimeOfDay,
} from "./coach/homeGreeting";
export {
  buildCoachContext,
  getHomeCoachPlan,
  getPostWorkoutRecap,
  getWeighInReaction,
  getWeighInReactionForDisplay,
  getNotificationBody,
  getPrimaryBarrierCoachNote,
  getFirstSessionCoachNote,
  getTrainingStyleFromProfile,
  getWeeklyCoachReview,
  getHomeWeekSlideCoachNote,
  getSundayCheckInCoachNote,
  BARRIER_COACH_COPY,
  type CoachTaskKind,
  type CoachTask,
  type HomeCoachPlan,
  type CoachAdjustment,
  type CoachNotificationKind,
  type WeeklyCoachReview,
  type CoachContext,
  type SundayCheckInCoachInput,
} from "./coach/coachEngine";
