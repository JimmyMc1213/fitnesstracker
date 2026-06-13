import type { OnboardingProfile, WeightUnit } from "@newyouai/types";

import { LBS_PER_KG } from "@/lib/unitConversions";

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
  return "Most NewYou members say the change feels obvious within a few weeks, and it's built to last.";
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
