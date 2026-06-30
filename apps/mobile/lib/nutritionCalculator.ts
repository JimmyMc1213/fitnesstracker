import type { ActivityLevel, GoalPace, MacroTotals, NutritionGoal, OnboardingProfile, UserGender } from "@newyouai/types";

import { LBS_PER_KG } from "@/lib/unitConversions";

export type NutritionCalcInput = {
  weightLbs: number;
  heightIn: number;
  age: number;
  gender: UserGender;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  pace?: GoalPace;
  goalWeightLbs?: number;
};

export function nutritionCalcInputFromOnboardingProfile(
  profile: OnboardingProfile,
  ageOverride?: number,
): NutritionCalcInput {
  return {
    weightLbs: profile.weightLbs,
    heightIn: profile.heightIn,
    age: ageOverride ?? profile.age,
    gender: profile.gender ?? "male",
    activityLevel: profile.activityLevel ?? "moderate",
    goal: profile.goal ?? "maintain",
    pace: profile.pace,
    goalWeightLbs: profile.goalWeightLbs,
  };
}

export function calculateBmr(input: Pick<NutritionCalcInput, "weightLbs" | "heightIn" | "age" | "gender">): number {
  const kg = input.weightLbs / LBS_PER_KG;
  const cm = input.heightIn * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * input.age;
  if (input.gender === "female") return base - 161;
  if (input.gender === "male") return base + 5;
  return base - 78;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.725,
};

const GOAL_CAL_ADJUST: Record<Exclude<NutritionGoal, "maintain">, Record<GoalPace, number>> = {
  cut: { slow: -250, balanced: -500, aggressive: -750 },
  bulk: { slow: 150, balanced: 300, aggressive: 450 },
};

const MIN_CALORIES: Record<UserGender, number> = {
  female: 1400,
  male: 1600,
  other: 1500,
};

/** Heaviest body weight (lbs) used as the basis for the 1g/lb protein target. */
const PROTEIN_BASIS_CAP_LBS = 215;

/** Largest sustainable deficit as a fraction of TDEE (never cut more than 25%). */
const MAX_DEFICIT_FRACTION = 0.25;

function goalCalAdjust(input: NutritionCalcInput): number {
  if (input.goal === "maintain") return 0;
  const pace = input.pace ?? "balanced";
  return GOAL_CAL_ADJUST[input.goal][pace];
}

function proteinGrams(input: NutritionCalcInput): number {
  if (input.goal === "bulk") {
    const goalWeight = input.goalWeightLbs ?? input.weightLbs;
    return Math.min(goalWeight, PROTEIN_BASIS_CAP_LBS) * 1.0;
  }
  if (input.goal === "cut") return Math.min(input.weightLbs, PROTEIN_BASIS_CAP_LBS) * 1.0;
  return Math.min(input.weightLbs, PROTEIN_BASIS_CAP_LBS) * 0.85;
}

export function calculateNutritionTargets(input: NutritionCalcInput): MacroTotals {
  const bmr = calculateBmr(input);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[input.activityLevel]);
  // Healthier floor: never eat below BMR, never run a deficit larger than
  // MAX_DEFICIT_FRACTION of TDEE, and never below the gender minimum.
  const safeFloor = Math.max(
    MIN_CALORIES[input.gender],
    Math.round(bmr),
    Math.round(tdee * (1 - MAX_DEFICIT_FRACTION)),
  );
  const cal = Math.max(safeFloor, tdee + goalCalAdjust(input));

  const p = Math.min(300, Math.max(100, Math.round(proteinGrams(input))));
  const f = Math.max(40, Math.round((cal * 0.25) / 9));
  const c = Math.max(50, Math.round((cal - p * 4 - f * 9) / 4));

  return { cal: Math.round(cal), p, c, f };
}

export function isMacrosValid(macros: MacroTotals): boolean {
  return (
    macros.cal >= 1200 &&
    macros.cal <= 6000 &&
    macros.p >= 50 &&
    macros.p <= 400 &&
    macros.c >= 0 &&
    macros.c <= 800 &&
    macros.f >= 20 &&
    macros.f <= 300
  );
}
