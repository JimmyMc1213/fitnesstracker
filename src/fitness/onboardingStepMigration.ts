/** v2 (11-step wizard) step index → v3 (23-screen) step index. */
const V2_TO_V3_STEP: Record<number, number> = {
  0: 5, // Units
  1: 2, // Name
  2: 12, // Experience
  3: 13, // Equipment
  4: 8, // Goal
  5: 7, // Stats → weight (last combined stats screen)
  6: 11, // Activity
  7: 14, // Schedule → week calendar
  8: 15, // Templates → split reveal
  9: 17, // Nutrition → macros
  10: 19, // Reminders → notifications
};

export function migrateV2StepIndex(stepIndex: number): number {
  const mapped = V2_TO_V3_STEP[stepIndex];
  if (mapped != null) return mapped;
  return Math.min(Math.max(0, stepIndex), 22);
}
