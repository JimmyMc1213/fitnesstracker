import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  savePersistedSlice,
} from "@newyouai/core";
import type {
  AppState,
  AppTheme,
  EquipmentSetup,
  ExperienceLevel,
  FutureYouDraft,
  MacroTotals,
  NotificationPreferences,
  OnboardingProfile,
  PersistedFitnessSlice,
  SessionLength,
  SubscriptionTier,
  UnitPreferences,
  WorkoutRoutineTemplate,
} from "@newyouai/types";

import { defaultHabitTemplatesFromOnboarding } from "@/lib/habitTemplates";
import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";
import { ensureMobilityHabitTemplate } from "@/lib/mobilityHabit";
import { localDateKey, completeOnboardingProfile, progressGoalFromOnboarding, ageFromDateOfBirth } from "@/lib/onboardingProfile";
import { clearOnboardingDraftStorage } from "@/lib/onboardingStorage";
import { ONBOARDING_PLAN_DEFAULT_STEPS_TARGET } from "@/lib/onboardingPlanSnapshot";
import { DEFAULT_WATER_DAILY_TARGET_OZ } from "@/lib/waterIntake";
import { sessionDurationFromSessionLength } from "@/lib/workout/workoutSplitByDays";
import { restSecondsForSessionLength } from "@/lib/workout/sessionLengthConfig";

const storageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export type FinishOnboardingInput = {
  displayName: string;
  profile: OnboardingProfile;
  unitPreferences: UnitPreferences;
  experienceLevel: ExperienceLevel;
  equipmentSetup: EquipmentSetup;
  sessionLength: SessionLength;
  draftTemplates: WorkoutRoutineTemplate[];
  macros: MacroTotals;
  notificationPrefs: NotificationPreferences;
  subscriptionTier: SubscriptionTier;
  theme: AppTheme;
  futureYou?: FutureYouDraft;
};

/** Persist fitness slice locally, clear draft, mark onboarding complete. Returns hydrated app state. */
export async function finishOnboarding(input: FinishOnboardingInput): Promise<AppState> {
  const age =
    input.profile.dateOfBirth
      ? (ageFromDateOfBirth(input.profile.dateOfBirth) ?? input.profile.age)
      : input.profile.age;

  const finalProfile = completeOnboardingProfile(
    {
      ...input.profile,
      sessionDuration: sessionDurationFromSessionLength(input.sessionLength),
    },
    age,
  );

  const existing = (await loadPersistedSlice<PersistedFitnessSlice>(
    storageAdapter,
    FITNESS_LOCAL_STORAGE_KEY,
  )) ?? {};

  const habitTemplates = ensureMobilityHabitTemplate(defaultHabitTemplatesFromOnboarding());
  const planStartIso = localDateKey(new Date());

  const slice: Partial<PersistedFitnessSlice> = {
    ...existing,
    displayName: input.displayName.trim(),
    unitPreferences: input.unitPreferences,
    unitPreferencesChosen: true,
    experienceLevel: input.experienceLevel,
    experienceLevelChosen: true,
    equipmentSetup: input.equipmentSetup,
    equipmentSetupChosen: true,
    onboardingProfile: finalProfile,
    onboardingComplete: true,
    onboardingDraft: null,
    workoutTemplates: input.draftTemplates,
    nutritionTargets: input.macros,
    notificationPreferences: input.notificationPrefs,
    progressGoal: progressGoalFromOnboarding(finalProfile),
    planStartIso,
    subscriptionTier: input.subscriptionTier,
    theme: input.theme,
    futureYou: input.futureYou && Object.keys(input.futureYou).length > 0 ? { ...input.futureYou } : undefined,
    habitTemplates,
    habitsDoneByDay: {},
    stepsTarget: ONBOARDING_PLAN_DEFAULT_STEPS_TARGET,
    waterDailyTargetOz: DEFAULT_WATER_DAILY_TARGET_OZ,
    restTimerDefaultSeconds: restSecondsForSessionLength(input.sessionLength),
  };

  await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, slice as PersistedFitnessSlice);
  await clearOnboardingDraftStorage();
  return buildFitnessAppState(slice as PersistedFitnessSlice);
}
