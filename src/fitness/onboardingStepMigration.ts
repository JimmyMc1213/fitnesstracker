/** v2 (11-step wizard) step index → v3 (23-screen) step index. */
const V2_TO_V3_STEP: Record<number, number> = {
  0: 5, // Units
  1: 2, // Name
  2: 12, // Experience
  3: 13, // Equipment
  4: 8, // Goal
  5: 7, // Stats → weight (last combined stats screen)
  6: 11, // Activity
  7: 13, // Schedule → week calendar
  8: 18, // Templates → nutrition (templates already collected in v2)
  9: 19, // Nutrition → protein priority
  10: 22, // Reminders → notifications
};

/** v7 step index → v8 (nutrition results before training plan). */
const V7_TO_V8_STEP: Record<number, number> = {
  18: 20, // split reveal → training reveal
  19: 23, // edit split removed → split reveal
  20: 18, // nutrition macros
  21: 19, // protein priority
};

/** v14 step index → v15 (+ theme picker after welcome). */
export function migrateThemeStepIndex(stepIndex: number): number {
  if (stepIndex >= 1) return stepIndex + 1;
  return Math.min(Math.max(0, stepIndex), 29);
}

/** v13 step index → v14 (+ save progress screen before paywall). */
export function migrateSaveProgressStepIndex(stepIndex: number): number {
  // v13 step 27 was the paywall; v14 inserts save progress at 27 and moves paywall to 28.
  // Keep index 27 so in-flight users see save progress instead of skipping straight to paywall.
  if (stepIndex > 27) return stepIndex + 1;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v12 step index → v13 (+ notification pre-prompt before reminder picker). */
export function migrateNotificationPrePromptStepIndex(stepIndex: number): number {
  if (stepIndex >= 24) return stepIndex + 1;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v11 step index → v12 (edit split screen removed; later steps shift down). */
export function migrateRemoveOnboardingEditStepIndex(stepIndex: number): number {
  if (stepIndex === 24) return 23;
  if (stepIndex > 24) return stepIndex - 1;
  return Math.min(Math.max(0, stepIndex), 28);
}

export function migrateNutritionBeforeTrainingStepIndex(stepIndex: number): number {
  const mapped = V7_TO_V8_STEP[stepIndex];
  if (mapped != null) return mapped;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v8 step index → v9 (+ session duration screen before schedule reinforcement). */
export function migrateTrainingDurationStepIndex(stepIndex: number): number {
  if (stepIndex >= 14) return stepIndex + 2;
  return Math.min(Math.max(0, stepIndex), 28);
}

export function migrateV2StepIndex(stepIndex: number): number {
  const mapped = V2_TO_V3_STEP[stepIndex];
  if (mapped != null) return mapped;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v10 step index → v11 (session length screen before workout calendar). */
export function migrateSessionLengthBeforeCalendarStepIndex(stepIndex: number): number {
  if (stepIndex === 13) return 14;
  if (stepIndex === 14) return 13;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v9 step index → v10 (+ plan-building screen after potential chart; removes late generating step). */
export function migratePlanBuildingStepIndex(stepIndex: number): number {
  if (stepIndex === 25) return 26;
  if (stepIndex >= 20 && stepIndex <= 24) return stepIndex + 1;
  return Math.min(Math.max(0, stepIndex), 28);
}

/** v15 step index → v16 (coaching loop screen removed; later steps shift down). */
export function migrateRemoveCoachingLoopStepIndex(stepIndex: number): number {
  if (stepIndex > 20) return stepIndex - 1;
  return Math.min(Math.max(0, stepIndex), 28);
}
