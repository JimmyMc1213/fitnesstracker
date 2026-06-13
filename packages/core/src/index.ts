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
export {
  ZERO_MACROS,
  manualTotalsForDateKey,
  sumNutritionItems,
  effectiveNutritionTotalsForDateKey,
  nutritionPresetFingerprint,
  stableLegacyNutritionLoggedAtMs,
  normalizeNutritionManualByDay,
  normalizeNutritionItemsByDay,
  mergePersistedNutritionDays,
  addNutritionFavorite,
  isNutritionFavorite,
  touchNutritionPresetById,
  normalizeNutritionPresets,
  normalizeNutritionUserFoods,
} from "./nutrition/nutritionTotals";
export {
  MACRO_LIMITS,
  clampMacroValue,
  clampMacroTotals,
  parseBoundedMacro,
  clampMacroInputString,
} from "./nutrition/macroLimits";
export { SERVING_DEFAULTS, getServingDefault } from "./nutrition/servingDefaults";
export { scaleMacros } from "./nutrition/foodSearchMacros";
export {
  OZ_TO_G,
  parseServingLabel,
  extractGramsFromServingText,
  buildMeasurements,
  inferMeasurementFromServing,
  getBaseGrams,
  computeServingMultiplier,
  formatServingLabel,
  parseQuantityInput,
  resolvePickerMeasurementFromServing,
  inferLoggedServingQuantity,
  loggedItemToPickerEdit,
} from "./nutrition/foodMeasurements";
export {
  MAX_NUTRITION_ITEMS_PER_DAY,
  nutritionItemsCountForDay,
  canAppendNutritionItem,
  newNutritionItemId,
  PROTEIN_QUICK_ADD_PRESETS,
  buildNutritionLoggedItem,
  getRecentlyLoggedFoods,
  appendNutritionLoggedItem,
  removeNutritionLoggedItem,
  updateNutritionLoggedItem,
  appendNutritionPresetToDay,
  topProteinPresetsForQuickLog,
  addNutritionFavoriteToState,
  removeNutritionFavoriteFromState,
  toggleNutritionFavoriteInState,
  upsertNutritionUserFood,
  removeNutritionUserFood,
  removeNutritionPreset,
  nutritionUserFoodFromLoggedItem,
  appendNutritionUserFoodToState,
  updateNutritionUserFoodInState,
  removeNutritionUserFoodFromState,
  removeNutritionPresetFromState,
} from "./nutrition/nutritionLog";
export type { NutritionQuickAddPreset } from "./nutrition/nutritionLog";
export {
  normalizeNutritionMeals,
  sumMealMacros,
  formatMealServingLabel,
  mealItemFromUserFood,
  mealItemFromPreset,
  upsertNutritionMeal,
  appendNutritionMeal,
  updateNutritionMeal,
  removeNutritionMeal,
  buildLoggedItemFromMeal,
  logNutritionMealToDay,
  mergeNutritionMeals,
} from "./nutrition/nutritionMeals";
export { hasExistingFitnessData } from "./sync/onboardingSkip";
export { normalizeAppTheme } from "./sync/theme";
export { DEFAULT_UNIT_PREFERENCES, normalizeUnitPreferences } from "./sync/unitPreferences";
export {
  DEFAULT_WATER_DAILY_TARGET_OZ,
  mergeWaterLogByDay,
  normalizeWaterDailyTargetOz,
  normalizeWaterLogByDay,
  normalizeWaterLogEntry,
} from "./sync/waterIntake";
export {
  WATER_QUICK_ADD_OZ,
  WATER_QUICK_ADD_L,
  WATER_TARGET_PRESETS_OZ,
  WATER_TARGET_PRESETS_L,
  FL_OZ_TO_L,
  L_TO_FL_OZ,
  totalWaterOzForDateKey,
  removeWaterLogEntry,
  appendWaterLogEntry,
  formatWaterOz,
  formatWaterLitersFromOz,
  parseVolumeToOz,
  formatVolumeFromOz,
  formatWaterVolume,
  formatWaterVolumeAlt,
  waterQuickAddPresets,
  waterTargetPresets,
  formatWaterPreset,
} from "./nutrition/waterIntake";
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
export { exerciseNoteKey } from "./workout/exerciseNoteKey";
export {
  formatSetWeight,
  formatWeeklyRateLbsPerWeek,
  weightUnitLabel,
  LBS_PER_KG,
} from "./workout/unitDisplay";
export {
  findLastLoggedExerciseSets,
  autofillSetsForTemplateCount,
  autofillExerciseSets,
  buildSetsForExercise,
} from "./workout/workoutAutofill";
export {
  formatPreviousSetLine,
  previousSetsForExercise,
  previousSetAtIndex,
  previousSetLinesForExercise,
  setFieldPlaceholder,
  canCompleteSet,
  buildSetCompletionPatch,
} from "./workout/workoutPreviousSets";
export { buildCompletedWorkoutSession, appendWorkoutHistory } from "./workout/workoutHistorySession";
export {
  normalizeExerciseKey,
  sessionBestForExercise,
  buildWorkoutSessionSummary,
  personalBestsAfterSession,
  formatWorkoutDuration,
} from "./workout/workoutSummarySession";
export {
  appendExerciseSessionHistory,
  getExerciseSessionHistory,
} from "./workout/exerciseSessionHistoryAppend";
export {
  exerciseOrderKeys,
  detectExerciseOrderChange,
  applyOrderToTemplate,
} from "./workout/workoutTemplateOrder";
export {
  finishWorkout,
  applyTemplateOrderUpdate,
  dismissTemplateOrderUpdatePrompt,
  dismissWorkoutSummary,
  type FinishWorkoutResult,
} from "./workout/finishWorkout";
export {
  sanitizeCoachCopy,
  getExerciseSessionNote,
  buildSessionCoachNoteForExercise,
  buildSessionCoachNotesByExerciseId,
  type ExerciseSessionNoteContext,
} from "./workout/exerciseSessionNotes";
export {
  REPS_ONLY_ADD_WEIGHT_THRESHOLD,
  TIME_PROGRESSION_STEP_SEC,
  TIME_STRUGGLE_DROP_SEC,
  carryUsesMeters,
  getExerciseProgressionKind,
  resolveExerciseId,
  type ExerciseProgressionKind,
} from "./workout/exerciseProgressionProfile";
export { findBrowsableExercise, BROWSABLE_EXERCISES } from "./workout/exerciseLookup";
export { default as exerciseLibrary, type Exercise } from "./workout/exerciseLibrary";
export { default as exerciseExpansion } from "./workout/exerciseExpansion";
export { EXERCISE_EQUIPMENT_LABELS, inferExerciseEquipmentLabel, type ExerciseEquipmentLabel } from "./workout/exerciseLabels";
export {
  deltaColorForSentiment,
  MAINTAIN_WEIGHT_BAND_LBS,
  WEIGHT_DELTA_CAUTION_COLOR,
  WEIGHT_DELTA_NEG_COLOR,
  WEIGHT_DELTA_POS_COLOR,
  weightDeltaSentiment,
  type WeightDeltaSentiment,
} from "./progress/weightProgress";
export { meanWeightInRangeOrNull } from "./progress/meanWeightInRange";
export {
  MIN_WEIGH_INS_FOR_FULL_RECAP,
  SUNDAY_CHECK_IN_STEPS,
  buildSundayCheckInData,
  commitSundayCheckIn,
  dismissSundayCheckIn,
  isSundayCheckInComplete,
  isSundayCheckInDay,
  shouldShowSundayCheckIn,
  sundayNoonForCurrentWeek,
  type SundayCheckInCoachItem,
  type SundayCheckInCommitmentOption,
  type SundayCheckInDailyWeight,
  type SundayCheckInData,
  type SundayCheckInDayCell,
  type SundayCheckInFuelUpdate,
  type SundayCheckInMetric,
} from "./sunday/sundayCheckIn";
export {
  buildSundayCheckInDayCells,
  buildSundayCheckInHeadline,
  buildSundayCheckInMetrics,
  buildSundayCheckInWatchItems,
  buildSundayCheckInWins,
  buildSundayCommitmentOptions,
  buildSundayFuelUpdate,
  buildSundayWeightInsight,
  formatRangeCaps,
  goalPaceLabel,
} from "./sunday/sundayCheckInCoachContent";
export {
  appendSundayCheckInHistory,
  buildSundayHistoryWins,
  buildSundayMultiWeekContext,
  compactSundayDayFlags,
  normalizeSundayCheckInHistory,
  onTrackWeekStreak,
  planStartWeightLbs,
  priorSundayCheckInWeek,
  weekRecordFromCheckInData,
} from "./sunday/sundayCheckInHistory";
export {
  collectProgressPicGalleryItems,
  formatProgressPicDate,
  newProgressPicId,
  normalizeProgressPics,
  normalizeProgressPicsLock,
  upsertWeighInProgressPic,
  withProgressPicsDefaults,
  type ProgressPicGalleryItem,
} from "./progress/progressPics";
export {
  buildPersonalRecordsBoard,
  formatPersonalRecordDate,
  formatPersonalRecordSet,
  formatRecordHeroParts,
  parseExerciseNoteKey,
  type PersonalRecordExerciseRow,
  type PersonalRecordHistoryEntry,
} from "./progress/personalRecordsBoard";
export {
  AVERAGE_CAL_WEEK_OPTIONS,
  buildAverageCalWeekStats,
  macroCaloriesFromTotals,
  niceChartMaxCal,
  weekAnchorWeeksAgo,
  type AverageCalDay,
  type AverageCalWeekStats,
  type MacroCalories,
} from "./progress/averageCalTracker";
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
