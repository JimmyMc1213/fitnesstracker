import type {
  AppTheme,
  EquipmentSetup,
  ExperienceLevel,
  FutureYouDraft,
  MacroTotals,
  OnboardingProfile,
  SessionLength,
  SubscriptionTier,
  UnitPreferences,
  WorkoutRoutineTemplate,
} from "@newyouai/types";

import { ONBOARDING_NOTIFICATION_DEFAULTS } from "@/lib/notificationPreferences";

/** Empty profile, selections come from step screens in RN-4-02+. */
export const FRESH_ONBOARDING_PROFILE: OnboardingProfile = {
  heightIn: 0,
  weightLbs: 0,
  age: 0,
};

/** Wizard starts with no unit picks; user must choose each category on step 5. */
export const EMPTY_WIZARD_UNIT_PREFERENCES: Partial<UnitPreferences> = {};

export function isUnitPreferencesComplete(
  prefs: Partial<UnitPreferences>,
): prefs is UnitPreferences {
  return prefs.weightUnit != null && prefs.heightUnit != null && prefs.volumeUnit != null;
}

/** Blank wizard state when the user taps Get Started on the welcome screen. */
export function freshWizardStateAtStep(stepIndex: number) {
  return {
    stepIndex,
    displayName: "",
    profile: { ...FRESH_ONBOARDING_PROFILE },
    unitPreferences: { ...EMPTY_WIZARD_UNIT_PREFERENCES },
    experienceLevel: undefined as ExperienceLevel | undefined,
    equipmentSetup: undefined as EquipmentSetup | undefined,
    sessionLength: undefined as SessionLength | undefined,
    draftTemplates: undefined as WorkoutRoutineTemplate[] | undefined,
    macros: undefined as MacroTotals | undefined,
    notificationPrefs: { ...ONBOARDING_NOTIFICATION_DEFAULTS },
    subscriptionTier: null as SubscriptionTier | null,
    draftTheme: undefined as AppTheme | undefined,
    futureYou: undefined as FutureYouDraft | undefined,
  };
}
