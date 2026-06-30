import {
  buildOnboardingDraft,
  DEFAULT_UNIT_PREFERENCES,
  FUTURE_YOU_GENERATION_REFUSED_ERROR,
  ONBOARDING_STEP_PAYWALL,
  type OnboardingDraftInput,
} from "@newyouai/core";
import type { FutureYouDraft } from "@newyouai/types";

import { ONBOARDING_NOTIFICATION_DEFAULTS } from "@/lib/notificationPreferences";
import {
  calculateNutritionTargets,
  nutritionCalcInputFromOnboardingProfile,
} from "@/lib/nutritionCalculator";
import {
  clearOnboardingDraftStorage,
  persistOnboardingDraft,
  writeOnboardingComplete,
} from "@/lib/onboardingStorage";

/** Dev-only helpers for walking onboarding on simulator without reinstalling. */
export function isOnboardingDevToolsEnabled(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__ && process.env.EXPO_PUBLIC_ONBOARDING_DEV_TOOLS === "1";
}

export function isOnboardingDevResetEnabled(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

export const DEV_PAYWALL_FAILED_JOB_ID = "550e8400-e29b-41d4-a716-446655440001";

/** Patch that puts Future You in a terminal failed state for paywall recovery UI. */
export function paywallFailedFutureYouPatch(
  current: FutureYouDraft | undefined,
): FutureYouDraft {
  return {
    photoSkipped: false,
    photoUploaded: true,
    photoAiConsentAt: current?.photoAiConsentAt ?? new Date().toISOString(),
    photoStoragePath: current?.photoStoragePath ?? "dev/seed-photo.jpg",
    motivationId: current?.motivationId ?? "cut_generic_confident",
    motivationIsGeneric: current?.motivationIsGeneric ?? true,
    onboardingGoalLocked: true,
    generationJobId: current?.generationJobId ?? DEV_PAYWALL_FAILED_JOB_ID,
    generationStatus: "failed",
    generationError: current?.generationError ?? FUTURE_YOU_GENERATION_REFUSED_ERROR,
    generationReadyAt: undefined,
  };
}

function buildPaywallFailedFutureYouDraftInput(): OnboardingDraftInput {
  const profile = {
    goal: "cut" as const,
    heightIn: 70,
    weightLbs: 180,
    goalWeightLbs: 165,
    age: 30,
    gender: "male" as const,
    activityLevel: "moderate" as const,
    workoutDaysPerWeek: 4 as const,
    pace: "balanced" as const,
    dateOfBirth: "1996-01-15",
    trainingStyle: "flexible" as const,
  };
  const macros = calculateNutritionTargets(
    nutritionCalcInputFromOnboardingProfile(profile, 30),
  );

  return {
    stepIndex: ONBOARDING_STEP_PAYWALL,
    displayName: "Friend",
    unitPreferences: DEFAULT_UNIT_PREFERENCES,
    experienceLevel: "intermediate",
    equipmentSetup: "full_gym",
    sessionLength: "45_60",
    profile,
    macros,
    notificationPrefs: ONBOARDING_NOTIFICATION_DEFAULTS,
    subscriptionTier: null,
    futureYou: paywallFailedFutureYouPatch(undefined),
  };
}

/** Persist onboarding draft at paywall with a failed Future You job (survives reload). */
export async function seedPaywallFailedFutureYouState(): Promise<void> {
  const draft = buildOnboardingDraft(buildPaywallFailedFutureYouDraftInput());
  await persistOnboardingDraft(draft);
}

export async function resetOnboardingProgress(): Promise<void> {
  await clearOnboardingDraftStorage();
  await writeOnboardingComplete(false);
}
