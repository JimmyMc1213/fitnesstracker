import {
  createEmptyPersistedSlice,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_UNIT_PREFERENCES,
  localDateKey,
} from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

import { FITNESS_LOCAL_STORAGE_KEY } from "./persistFitnessSlice";

const DEFAULT_TARGETS = { cal: 2000, p: 180, c: 200, f: 65 };

function coachNutritionSeed(dateKey: string): PersistedFitnessSlice {
  return createEmptyPersistedSlice({
    onboardingComplete: true,
    displayName: "Test",
    theme: "dark",
    nutritionTargets: { ...DEFAULT_TARGETS },
    workoutTemplates: [
      {
        id: "mon-upper",
        name: "Upper strength",
        dayLabel: "Mon",
        focus: "Bench · Pulldown · Accessories",
        exercises: [],
      },
    ],
    planStartIso: "2026-05-07",
    stepsTarget: 10_000,
    onboardingProfile: {
      goal: "maintain",
      heightIn: 70,
      weightLbs: 180,
      age: 30,
      gender: "male",
      activityLevel: "moderate",
      workoutDaysPerWeek: 5,
    },
    unitPreferences: { ...DEFAULT_UNIT_PREFERENCES },
    unitPreferencesChosen: true,
    notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    subscriptionTier: "pro",
    workoutsCompletedByDay: { [dateKey]: true },
    nutritionItemsByDay: {
      [dateKey]: [{ id: "e2e-meal", name: "Post-workout meal", cal: 600, p: 180, c: 40, f: 12 }],
    },
  }) as PersistedFitnessSlice;
}

/** Dev-only: seed local fitness state so PWA matches RN `EXPO_PUBLIC_E2E_FITNESS_SEED=coach-nutrition`. */
export function applyVisualParityBootstrapIfEnabled(): void {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_VISUAL_PARITY !== "true") return;
  if (typeof localStorage === "undefined") return;

  const dateKey = localDateKey(new Date());
  const seed = coachNutritionSeed(dateKey);
  localStorage.setItem(FITNESS_LOCAL_STORAGE_KEY, JSON.stringify(seed));
  localStorage.removeItem("gymmy_onboarding_draft");
  document.documentElement.dataset.visualParity = "true";
  document.documentElement.dataset.theme = "dark";
}

export function isVisualParityMode(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_VISUAL_PARITY === "true";
}
