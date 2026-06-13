export function defaultGoalWeightLbs(goal: "cut" | "bulk", currentLbs: number): number {
  if (goal === "cut") return Math.max(currentLbs - 80, Math.min(currentLbs - 5, currentLbs - 15));
  return Math.min(currentLbs + 50, Math.max(currentLbs + 3, currentLbs + 15));
}
