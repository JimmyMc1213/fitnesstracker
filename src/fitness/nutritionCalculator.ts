import type { ActivityLevel, FitnessGoal, Gender, MacroTotals } from "./types";

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const GOAL_CAL_ADJUST: Record<FitnessGoal, number> = {
  bulk: 300,
  cut: -500,
  maintain: 0,
};

function mifflinStJeorBmr(weightLbs: number, heightIn: number, age: number, gender: Gender): number {
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightIn * 2.54;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateTdee(
  weightLbs: number,
  heightIn: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: FitnessGoal,
): number {
  const bmr = mifflinStJeorBmr(weightLbs, heightIn, age, gender);
  const tdee = bmr * ACTIVITY_MULTIPLIER[activityLevel];
  return Math.max(1200, Math.round(tdee + GOAL_CAL_ADJUST[goal]));
}

/** Protein ~1 g/lb; fat ~27.5% kcal; carbs fill remainder. */
export function calculateMacroTargets(
  weightLbs: number,
  heightIn: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: FitnessGoal,
): MacroTotals {
  const cal = calculateTdee(weightLbs, heightIn, age, gender, activityLevel, goal);
  const p = Math.round(weightLbs);
  const f = Math.round((cal * 0.275) / 9);
  const c = Math.max(0, Math.round((cal - p * 4 - f * 9) / 4));
  return { cal, p, c, f };
}
