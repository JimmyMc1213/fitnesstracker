import type { NutritionGoal, OnboardingProfile, WeightUnit } from "@newyouai/types";

import { formatWeightFromLbs } from "@/lib/unitConversions";

export function futureYouGoalLabel(goal: NutritionGoal | undefined): string {
  if (goal === "cut") return "Lose weight";
  if (goal === "bulk") return "Gain weight";
  return "Maintain";
}

function compactWeightUnitLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lb";
}

/** Signed weight delta for cut/bulk goals, or null for maintain / missing data. */
export function futureYouWeightDeltaLabel(
  profile: Pick<OnboardingProfile, "goal" | "weightLbs" | "goalWeightLbs">,
  weightUnit: WeightUnit,
): string | null {
  const goal = profile.goal;
  if (!goal || goal === "maintain") return null;

  const goalWeight = profile.goalWeightLbs;
  if (goalWeight == null || !Number.isFinite(goalWeight)) return null;

  const deltaLbs = Math.abs(profile.weightLbs - goalWeight);
  if (deltaLbs < 1) return null;

  const magnitude = formatWeightFromLbs(deltaLbs, weightUnit, 0);
  const sign = goal === "cut" ? "-" : "+";
  const unit = compactWeightUnitLabel(weightUnit);
  return `${sign}${magnitude} ${unit}`;
}

/** Parse coarse timeline strings ("3 months", "1 year") into month count. */
export function futureYouTimelineMonths(timeline: string): number {
  const monthsMatch = timeline.match(/^(\d+)\s+months?$/);
  if (monthsMatch) return parseInt(monthsMatch[1], 10);

  const yearMatch = timeline.match(/^(\d+)\s+years?$/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;

  return 3;
}

/** Target month label from today + timeline, e.g. "Aug 2026". */
export function futureYouTargetMonthLabel(timeline: string, now = new Date()): string {
  const months = futureYouTimelineMonths(timeline);
  const target = new Date(now);
  target.setMonth(target.getMonth() + months);
  return target.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Combined detail line: signed delta + target month, or just month for maintain. */
export function futureYouGoalDetailLine(
  profile: Pick<OnboardingProfile, "goal" | "weightLbs" | "goalWeightLbs">,
  weightUnit: WeightUnit,
  timeline: string,
  now = new Date(),
): string {
  const month = futureYouTargetMonthLabel(timeline, now);
  const delta = futureYouWeightDeltaLabel(profile, weightUnit);
  if (delta) return `${delta} · ${month}`;
  return month;
}
