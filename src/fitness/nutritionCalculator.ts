import { LBS_PER_KG } from "./unitPreferences";
import type { ActivityLevel, GoalPace, MacroTotals, NutritionGoal, UserGender } from "./types";

export type NutritionCalcInput = {
  weightLbs: number;
  heightIn: number;
  age: number;
  gender: UserGender;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  pace?: GoalPace;
  /** Target weight for bulk protein (1g per lb of goal weight). */
  goalWeightLbs?: number;
};

/** Mifflin–St Jeor basal metabolic rate (kcal/day). */
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

function goalCalAdjust(input: NutritionCalcInput): number {
  if (input.goal === "maintain") return 0;
  const pace = input.pace ?? "balanced";
  return GOAL_CAL_ADJUST[input.goal][pace];
}

function proteinGrams(input: NutritionCalcInput): number {
  if (input.goal === "bulk") {
    const goalWeight = input.goalWeightLbs ?? input.weightLbs;
    return goalWeight * 1.0;
  }
  if (input.goal === "cut") return input.weightLbs * 1.0;
  return input.weightLbs * 0.85;
}

/** Mifflin–St Jeor TDEE with goal adjustment; macros from calories and body weight. */
export function calculateNutritionTargets(input: NutritionCalcInput): MacroTotals {
  const bmr = calculateBmr(input);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[input.activityLevel]);
  const minCal = MIN_CALORIES[input.gender];
  const cal = Math.max(minCal, tdee + goalCalAdjust(input));

  const p = Math.min(300, Math.max(100, Math.round(proteinGrams(input))));
  const f = Math.max(40, Math.round((cal * 0.25) / 9));
  const c = Math.max(50, Math.round((cal - p * 4 - f * 9) / 4));

  return { cal: Math.round(cal), p, c, f };
}

/** TDEE before goal adjustment (kcal/day). */
export function calculateTdee(input: NutritionCalcInput): number {
  return Math.round(calculateBmr(input) * ACTIVITY_MULTIPLIER[input.activityLevel]);
}

export function activityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: "Mostly seated",
    light: "Light (1-2 days/wk)",
    moderate: "Moderate (3-4 days/wk)",
    active: "Active (5-6 days/wk)",
    very_active: "Very active (daily + physical job)",
  };
  return labels[level];
}

export function nutritionGoalLabel(goal: NutritionGoal): string {
  return goal === "bulk" ? "Bulk" : goal === "cut" ? "Cut" : "Maintain";
}
