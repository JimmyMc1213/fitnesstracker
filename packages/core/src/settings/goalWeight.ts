const CUT_WEIGHT_FLOOR_LBS = 110;

export function defaultGoalWeightLbs(goal: "cut" | "bulk", currentLbs: number): number {
  const minLbs = goal === "cut" ? Math.max(CUT_WEIGHT_FLOOR_LBS, currentLbs - 80) : currentLbs + 3;
  const maxLbs = goal === "cut" ? currentLbs - 5 : currentLbs + 50;
  const target = goal === "cut" ? currentLbs - 10 : currentLbs + 10;
  return Math.min(maxLbs, Math.max(minLbs, target));
}
