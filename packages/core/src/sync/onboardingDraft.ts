import type {
  AppTheme,
  EquipmentSetup,
  ExperienceLevel,
  MacroTotals,
  NotificationPreferences,
  OnboardingDraft,
  OnboardingProfile,
  SessionLength,
  UnitPreferences,
  WorkoutRoutineTemplate,
} from "@newyouai/types";
import { clampOnboardingStepIndex } from "../onboarding/steps";
import { normalizeFutureYouDraft } from "./futureYouDraft";
import {
  migrateNutritionBeforeTrainingStepIndex,
  migrateNotificationPrePromptStepIndex,
  migratePlanBuildingStepIndex,
  migrateRemoveCoachingLoopStepIndex,
  migrateRemoveOnboardingEditStepIndex,
  migrateRemoveSaveProgressStepIndex,
  migrateSaveProgressStepIndex,
  migrateSessionLengthBeforeCalendarStepIndex,
  migrateThemeStepIndex,
  migrateTrainingDurationStepIndex,
  migrateV2StepIndex,
} from "./onboardingStepMigration";

export const ONBOARDING_DRAFT_VERSION = 18;
export const ONBOARDING_DRAFT_VERSION_PRE_SAVE_PROGRESS_REMOVED = 17;
export const ONBOARDING_DRAFT_VERSION_PRE_FUTURE_YOU = 16;
export const ONBOARDING_DRAFT_VERSION_PRE_COACHING_LOOP = 15;
export const ONBOARDING_DRAFT_VERSION_PRE_THEME = 14;
export const ONBOARDING_DRAFT_VERSION_PRE_SAVE_PROGRESS = 13;
export const ONBOARDING_DRAFT_VERSION_PRE_NOTIFICATION_PROMPT = 12;
export const ONBOARDING_DRAFT_VERSION_PRE_EDIT_SPLIT = 11;
export const ONBOARDING_DRAFT_VERSION_PRE_WORKOUT_ENGINE = 10;
export const ONBOARDING_DRAFT_VERSION_PRE_TRAINING_DURATION = 8;
export const ONBOARDING_DRAFT_VERSION_NUTRITION_BEFORE_TRAINING = 7;
export const ONBOARDING_DRAFT_VERSION_WITH_COMPARISON = 6;
export const ONBOARDING_DRAFT_VERSION_MOTIVATION_SURVEY = 5;
export const ONBOARDING_DRAFT_VERSION_PRE_REFERRAL = 3;
export const ONBOARDING_DRAFT_VERSION_LEGACY = 2;

function draftTimestamp(draft: OnboardingDraft): string {
  return draft.updatedAtIso;
}

function migrateToCurrentStepIndex(stepIndex: number): number {
  return migrateRemoveSaveProgressStepIndex(
    migrateRemoveCoachingLoopStepIndex(
      migrateThemeStepIndex(
        migrateSaveProgressStepIndex(
          migrateNotificationPrePromptStepIndex(migrateRemoveOnboardingEditStepIndex(Math.round(stepIndex))),
        ),
      ),
    ),
  );
}

function migrateDraftVersion(raw: Record<string, unknown>): { stepIndex: number; version: number } | null {
  const version = Number(raw.version);
  const stepIndex = Number(raw.stepIndex);
  if (!Number.isFinite(stepIndex) || stepIndex < 0) return null;
  if (version === ONBOARDING_DRAFT_VERSION) {
    return { stepIndex: clampOnboardingStepIndex(stepIndex), version: ONBOARDING_DRAFT_VERSION };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_SAVE_PROGRESS_REMOVED) {
    return {
      stepIndex: migrateRemoveSaveProgressStepIndex(clampOnboardingStepIndex(stepIndex)),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_FUTURE_YOU) {
    return {
      stepIndex: migrateRemoveSaveProgressStepIndex(clampOnboardingStepIndex(stepIndex)),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_COACHING_LOOP) {
    return {
      stepIndex: migrateRemoveSaveProgressStepIndex(migrateRemoveCoachingLoopStepIndex(Math.round(stepIndex))),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_THEME) {
    return {
      stepIndex: migrateRemoveSaveProgressStepIndex(
        migrateRemoveCoachingLoopStepIndex(migrateThemeStepIndex(Math.round(stepIndex))),
      ),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_SAVE_PROGRESS) {
    return {
      stepIndex: migrateRemoveSaveProgressStepIndex(
        migrateRemoveCoachingLoopStepIndex(
          migrateThemeStepIndex(migrateSaveProgressStepIndex(Math.round(stepIndex))),
        ),
      ),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_NOTIFICATION_PROMPT) {
    return {
      stepIndex: migrateToCurrentStepIndex(migrateNotificationPrePromptStepIndex(Math.round(stepIndex))),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_EDIT_SPLIT) {
    return {
      stepIndex: migrateToCurrentStepIndex(stepIndex),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_WORKOUT_ENGINE) {
    return {
      stepIndex: migrateToCurrentStepIndex(migrateSessionLengthBeforeCalendarStepIndex(Math.round(stepIndex))),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_WORKOUT_ENGINE - 1) {
    return {
      stepIndex: migrateToCurrentStepIndex(
        migrateSessionLengthBeforeCalendarStepIndex(migratePlanBuildingStepIndex(Math.round(stepIndex))),
      ),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_TRAINING_DURATION) {
    return {
      stepIndex: migrateToCurrentStepIndex(
        migratePlanBuildingStepIndex(migrateTrainingDurationStepIndex(Math.round(stepIndex))),
      ),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_NUTRITION_BEFORE_TRAINING) {
    const afterNutrition = migrateNutritionBeforeTrainingStepIndex(Math.round(stepIndex));
    return {
      stepIndex: migrateToCurrentStepIndex(
        migratePlanBuildingStepIndex(migrateTrainingDurationStepIndex(afterNutrition)),
      ),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_WITH_COMPARISON) {
    const idx = Math.round(stepIndex);
    const migratedStep = idx >= 18 ? idx - 1 : idx;
    return {
      stepIndex: migrateToCurrentStepIndex(migratedStep),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_MOTIVATION_SURVEY) {
    return {
      stepIndex: migrateToCurrentStepIndex(stepIndex),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === 4) {
    const idx = Math.round(stepIndex);
    const migratedStep = idx >= 14 && idx <= 21 ? idx + 4 : idx;
    return {
      stepIndex: migrateToCurrentStepIndex(migratedStep),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_PRE_REFERRAL) {
    const migratedStep = stepIndex >= 3 ? Math.round(stepIndex) + 1 : Math.round(stepIndex);
    return {
      stepIndex: migrateToCurrentStepIndex(migratedStep),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  if (version === ONBOARDING_DRAFT_VERSION_LEGACY) {
    return {
      stepIndex: migrateToCurrentStepIndex(migrateV2StepIndex(Math.round(stepIndex))),
      version: ONBOARDING_DRAFT_VERSION,
    };
  }
  return null;
}

export function normalizeOnboardingDraft(raw: unknown): OnboardingDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const migrated = migrateDraftVersion(o);
  if (!migrated) return null;
  const stepIndex = migrated.stepIndex;
  const updatedAtIso =
    typeof o.updatedAtIso === "string" ? o.updatedAtIso
    : typeof o.updatedAt === "string" ? o.updatedAt
    : new Date(0).toISOString();
  const displayName = typeof o.displayName === "string" ? o.displayName : "";
  const unitPreferences = o.unitPreferences;
  const experienceLevel = o.experienceLevel;
  const equipmentSetup = o.equipmentSetup;
  const profile = o.profile;
  if (!unitPreferences || !profile) return null;

  const subscriptionTier = o.subscriptionTier === "free" || o.subscriptionTier === "pro" ? o.subscriptionTier : undefined;

  return {
    version: ONBOARDING_DRAFT_VERSION,
    stepIndex: Math.round(stepIndex),
    updatedAtIso,
    displayName,
    unitPreferences: unitPreferences as UnitPreferences,
    experienceLevel:
      experienceLevel === "beginner" || experienceLevel === "intermediate" || experienceLevel === "advanced"
        ? experienceLevel
        : undefined,
    equipmentSetup:
      equipmentSetup === "full_gym" ||
      equipmentSetup === "home_gym" ||
      equipmentSetup === "dumbbells_only" ||
      equipmentSetup === "bodyweight_only"
        ? equipmentSetup
        : undefined,
    profile: profile as OnboardingProfile,
    sessionLength:
      o.sessionLength === "under_30" ||
      o.sessionLength === "30_45" ||
      o.sessionLength === "45_60" ||
      o.sessionLength === "60_90" ||
      o.sessionLength === "90_plus"
        ? o.sessionLength
        : undefined,
    draftTemplates: Array.isArray(o.draftTemplates) ? (o.draftTemplates as WorkoutRoutineTemplate[]) : undefined,
    macros: o.macros && typeof o.macros === "object" ? (o.macros as MacroTotals) : undefined,
    notificationPrefs:
      o.notificationPrefs && typeof o.notificationPrefs === "object"
        ? (o.notificationPrefs as NotificationPreferences)
        : undefined,
    subscriptionTier,
    theme: o.theme === "light" || o.theme === "dark" ? (o.theme as AppTheme) : undefined,
    futureYou: normalizeFutureYouDraft(o.futureYou),
  };
}

/** Prefer the draft with the latest timestamp. */
export function mergeOnboardingDrafts(
  local: OnboardingDraft | null | undefined,
  remote: OnboardingDraft | null | undefined,
): OnboardingDraft | null {
  const ln = local ? normalizeOnboardingDraft(local) : null;
  const rn = remote ? normalizeOnboardingDraft(remote) : null;
  if (!ln) return rn;
  if (!rn) return ln;
  return draftTimestamp(ln) >= draftTimestamp(rn) ? ln : rn;
}

export type OnboardingDraftInput = {
  stepIndex: number;
  displayName: string;
  unitPreferences: UnitPreferences;
  experienceLevel?: ExperienceLevel;
  equipmentSetup?: EquipmentSetup;
  profile: OnboardingProfile;
  sessionLength?: SessionLength;
  draftTemplates?: WorkoutRoutineTemplate[];
  macros?: MacroTotals;
  notificationPrefs?: NotificationPreferences;
  subscriptionTier?: "free" | "pro" | null;
  theme?: AppTheme;
  futureYou?: import("@newyouai/types").FutureYouDraft;
};

export function buildOnboardingDraft(input: OnboardingDraftInput): OnboardingDraft {
  return {
    version: ONBOARDING_DRAFT_VERSION,
    stepIndex: Math.max(0, Math.round(input.stepIndex)),
    updatedAtIso: new Date().toISOString(),
    displayName: input.displayName,
    unitPreferences: { ...input.unitPreferences },
    experienceLevel: input.experienceLevel,
    equipmentSetup: input.equipmentSetup,
    profile: { ...input.profile },
    sessionLength: input.sessionLength,
    draftTemplates: input.draftTemplates?.map((t) => ({ ...t, exercises: [...t.exercises] })),
    macros: input.macros ? { ...input.macros } : undefined,
    notificationPrefs: input.notificationPrefs ? { ...input.notificationPrefs } : undefined,
    subscriptionTier: input.subscriptionTier ?? undefined,
    theme: input.theme,
    futureYou: input.futureYou ? { ...input.futureYou } : undefined,
  };
}
