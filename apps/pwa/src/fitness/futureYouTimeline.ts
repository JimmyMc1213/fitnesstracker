import type { GoalPace, OnboardingProfile } from "./types";

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

/** Paywall tagline: blur the count only, keep the unit readable (e.g. "3" + " months"). */
export function splitFutureYouTimelineForPaywall(timeline: string): { value: string; unit: string } {
  const trimmed = timeline.trim();
  const match = /^(\d+)\s+(.+)$/.exec(trimmed);
  if (match) {
    return { value: match[1], unit: ` ${match[2]}` };
  }
  return { value: trimmed, unit: "" };
}

function formatFutureYouTimelineWeeks(weeks: number): string {
  if (weeks <= 16) return "3 months";
  if (weeks <= 52) return "6 months";
  const months = Math.round(weeks / 4.33);
  if (months <= 12) return `${months} months`;
  const years = Math.round(months / 12);
  return years === 1 ? "1 year" : `${years} years`;
}
