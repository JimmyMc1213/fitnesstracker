import type { GoalPace, NutritionGoal, OnboardingProfile } from "./types";
import { activityLevelLabel, nutritionGoalLabel } from "./nutritionCalculator";
import { LBS_PER_KG } from "./unitPreferences";
import type { WeightUnit } from "./types";

const PACE_LABELS: Record<GoalPace, string> = {
  slow: "slow and steady",
  balanced: "balanced pace",
  aggressive: "aggressive pace",
};

export function goalSummaryLine(profile: OnboardingProfile): string {
  const goal =
    profile.goal === "cut" ? "lose weight"
    : profile.goal === "bulk" ? "build muscle"
    : "maintain and perform";
  const parts = [goal];
  if (profile.goal !== "maintain" && profile.pace) {
    parts.push(PACE_LABELS[profile.pace]);
  }
  if (profile.activityLevel) {
    parts.push(activityLevelLabel(profile.activityLevel).toLowerCase());
  }
  return parts.join(" · ");
}

export function goalReinforcementNote(profile: OnboardingProfile): string {
  if (profile.goal === "cut") {
    return "We'll calibrate your training volume and fuel plan for sustainable fat loss.";
  }
  if (profile.goal === "bulk") {
    return "We'll prioritize progressive overload and enough fuel to support muscle growth.";
  }
  return "We'll keep your training and nutrition aligned with performance, not extremes.";
}

export function trainingReinforcementNote(workoutDays: number): string {
  return `We'll adjust drills and session length to fit ${workoutDays} training day${workoutDays === 1 ? "" : "s"} per week.`;
}

export function trainingScheduleReinforcementParts(
  workoutDays: number,
): { verb: string; accent: string; tail: string } {
  const days = `${workoutDays} day${workoutDays === 1 ? "" : "s"} a week`;
  return {
    verb: "Training",
    accent: days,
    tail: " is a perfect fit. We'll tailor every workout around you and your schedule.",
  };
}

export function trainingScheduleReinforcementSubtext(): string {
  return "Your plan adapts to the days you picked, built for your real life, not a rigid template.";
}

export function goalWeightDirectionLabel(goal: NutritionGoal): string {
  if (goal === "cut") return "Lose weight";
  if (goal === "bulk") return "Gain weight";
  return "Target weight";
}

export function goalWeightDeltaDisplay(profile: OnboardingProfile, unit: WeightUnit): string {
  const target = profile.goalWeightLbs ?? profile.weightLbs;
  const deltaLbs = Math.abs(target - profile.weightLbs);
  const value = unit === "kg" ? deltaLbs / LBS_PER_KG : deltaLbs;
  const rounded = unit === "kg" ? Math.round(value * 10) / 10 : Math.round(value);
  const label = unit === "kg" ? "kg" : "lb";
  return `${rounded} ${label}`;
}

export function goalWeightReinforcementParts(
  profile: OnboardingProfile,
  unit: WeightUnit,
): { verb: string; delta: string; tail: string } {
  const delta = goalWeightDeltaDisplay(profile, unit);
  if (profile.goal === "cut") {
    return { verb: "Losing", delta, tail: " is a realistic target. It's not hard at all!" };
  }
  if (profile.goal === "bulk") {
    return { verb: "Gaining", delta, tail: " is a realistic target. You've got this!" };
  }
  return { verb: "Staying at", delta, tail: " keeps you performing at your best." };
}

export function goalWeightReinforcementSubtext(): string {
  return "Most Gymmy users say the change feels obvious within a few weeks, and it's built to last.";
}

/** First coach note on the plan-ready screen: what the coach does and how it supports the user's goal. */
export function planReadyFirstCoachNote(profile: OnboardingProfile): string {
  if (profile.goal === "cut") {
    return "I'm your coach. After each workout I'll tell you what to lift next so you stay strong while you lose weight. I'll flag protein or calorie slips so you lose fat, not muscle.";
  }
  if (profile.goal === "bulk") {
    return "I'm your coach. After each workout I'll tell you what to beat so muscle keeps building. I'll nudge you when fuel is low so growth never stalls.";
  }
  return "I'm your coach. After each workout I'll tell you what to push next so you keep improving. I'll keep your fuel on track so you perform at your best.";
}

export function nutritionReinforcementBody(profile: OnboardingProfile): string {
  const goalLabel = nutritionGoalLabel(profile.goal as NutritionGoal);
  if (profile.goal === "maintain") {
    return `${goalLabel}: fuel and recovery matched to your activity.`;
  }
  if (profile.goalWeightLbs != null) {
    const delta = Math.abs(profile.goalWeightLbs - profile.weightLbs);
    const direction = profile.goal === "cut" ? "down" : "up";
    return `${goalLabel}: about ${Math.round(delta)} lb ${direction}${profile.pace ? ` at ${PACE_LABELS[profile.pace]}` : ""}.`;
  }
  return `${goalLabel}${profile.pace ? ` at ${PACE_LABELS[profile.pace]}` : ""}.`;
}
