import { planWeekIndex } from "@newyouai/core";
import type { GoalPace, OnboardingProfile } from "@newyouai/types";

import { futureYouTimelineMonths } from "@/lib/futureYouGoalSummary";

/** Average weeks per month, used to convert the coarse timeline into weeks. */
const WEEKS_PER_MONTH = 4.345;

/** Rough lbs/week from calorie deficit/surplus (3500 kcal ≈ 1 lb). */
const PACE_LBS_PER_WEEK: Record<GoalPace, number> = {
  slow: 0.5,
  balanced: 1,
  aggressive: 1.5,
};

const DEFAULT_TIMELINE = "3 months";

/** Human-readable timeline for Future You generation and paywall copy. */
export function futureYouTimelineFromProfile(
  profile: Pick<OnboardingProfile, "goal" | "pace" | "weightLbs" | "goalWeightLbs">,
): string {
  if (profile.goal === "maintain") {
    return DEFAULT_TIMELINE;
  }

  const goalWeight = profile.goalWeightLbs;
  if (goalWeight == null || !Number.isFinite(goalWeight)) {
    return DEFAULT_TIMELINE;
  }

  const delta = Math.abs(profile.weightLbs - goalWeight);
  if (delta < 1) {
    return DEFAULT_TIMELINE;
  }

  const pace = profile.pace ?? "balanced";
  const weeks = delta / PACE_LBS_PER_WEEK[pace];
  return formatFutureYouTimelineWeeks(weeks);
}

function formatFutureYouTimelineWeeks(weeks: number): string {
  if (weeks <= 16) return "3 months";
  if (weeks <= 52) return "6 months";
  const months = Math.round(weeks / 4.33);
  if (months <= 12) return `${months} months`;
  const years = Math.round(months / 12);
  return years === 1 ? "1 year" : `${years} years`;
}

/**
 * Current week and total program weeks toward the user's Future You goal.
 * Week is 1-based from `planStartIso` and clamped to the timeline length.
 */
export function futureYouWeekProgress(
  profile: Pick<OnboardingProfile, "goal" | "pace" | "weightLbs" | "goalWeightLbs">,
  planStartIso: string,
  now = new Date(),
): { week: number; totalWeeks: number } {
  const timeline = futureYouTimelineFromProfile(profile);
  const totalWeeks = Math.max(1, Math.round(futureYouTimelineMonths(timeline) * WEEKS_PER_MONTH));
  const week = Math.min(planWeekIndex(now, planStartIso), totalWeeks);
  return { week, totalWeeks };
}

/** Split timeline for paywall hero blur effect (numeric value + unit suffix). */
export function splitFutureYouTimelineForPaywall(timeline: string): { value: string; unit: string } {
  const match = timeline.match(/^(\d+)\s+(month|months|year|years)$/);
  if (match) {
    return { value: match[1], unit: ` ${match[2]}` };
  }
  const yearMatch = timeline.match(/^(\d+)\s+(year|years)$/);
  if (yearMatch) {
    return { value: yearMatch[1], unit: ` ${yearMatch[2]}` };
  }
  return { value: timeline, unit: "" };
}
