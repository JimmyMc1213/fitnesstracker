import { LBS_PER_KG } from "./unitPreferences";
import type { ActivityLevel, MacroTotals, NutritionGoal, UserGender } from "./types";

export type NutritionCalcInput = {
  weightLbs: number;
  heightIn: number;
  age: number;
  gender: UserGender;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
};

function bmrKcal(input: NutritionCalcInput): number {
  const kg = input.weightLbs / LBS_PER_KG;
  const cm = (input.heightIn * 2.54);
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
  very_active: 1.9,
};

const GOAL_CAL_ADJUST: Record<NutritionGoal, number> = {
  maintain: 0,
  cut: -500,
  bulk: 300,
};

/** Mifflin–St Jeor TDEE with goal adjustment; macros from body weight. */
export function calculateNutritionTargets(input: NutritionCalcInput): MacroTotals {
  const tdee = Math.round(bmrKcal(input) * ACTIVITY_MULTIPLIER[input.activityLevel]);
  const cal = Math.max(1200, tdee + GOAL_CAL_ADJUST[input.goal]);
  const p = Math.round(input.weightLbs * (input.goal === "cut" ? 1.0 : 0.85));
  const f = Math.round((cal * 0.28) / 9);
  const c = Math.max(0, Math.round((cal - p * 4 - f * 9) / 4));
  return { cal, p, c, f };
}

export function activityLevelLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: "Mostly seated",
    light: "Light (1–2 days/wk)",
    moderate: "Moderate (3–4 days/wk)",
    active: "Active (5–6 days/wk)",
    very_active: "Very active (daily + physical job)",
  };
  return labels[level];
}

export function nutritionGoalLabel(goal: NutritionGoal): string {
  return goal === "bulk" ? "Bulk" : goal === "cut" ? "Cut" : "Maintain";
}
