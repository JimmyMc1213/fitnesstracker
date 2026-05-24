import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { loadPersistedSlice, savePersistedSlice } from "./persistFitnessSlice";
import { migrateV2StepIndex } from "./onboardingStepMigration";
import { safeJsonParse } from "./safeJsonParse";
import type {
  EquipmentSetup,
  ExperienceLevel,
  MacroTotals,
  NotificationPreferences,
  OnboardingDraft,
  OnboardingProfile,
  UnitPreferences,
  WorkoutRoutineTemplate,
} from "./types";

/** v2 = 11-step wizard; v3 = 23-screen Gymmy onboarding v2. */
export const ONBOARDING_DRAFT_VERSION = 3;
export const ONBOARDING_DRAFT_VERSION_LEGACY = 2;

export const GYMMY_ONBOARDING_DRAFT_KEY = "gymmy_onboarding_draft";

export type OnboardingDraftInput = {
  stepIndex: number;
  displayName: string;
  unitPreferences: UnitPreferences;
  experienceLevel: ExperienceLevel;
  equipmentSetup: EquipmentSetup;
  profile: OnboardingProfile;
  draftTemplates?: WorkoutRoutineTemplate[];
  macros?: MacroTotals;
  notificationPrefs?: NotificationPreferences;
  subscriptionTier?: "free" | "pro" | null;
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
    draftTemplates: input.draftTemplates?.map((t) => ({ ...t, exercises: [...t.exercises] })),
    macros: input.macros ? { ...input.macros } : undefined,
    notificationPrefs: input.notificationPrefs ? { ...input.notificationPrefs } : undefined,
    subscriptionTier: input.subscriptionTier ?? undefined,
  };
}

function draftTimestamp(draft: OnboardingDraft): string {
  return draft.updatedAtIso;
}

function migrateDraftVersion(raw: Record<string, unknown>): { stepIndex: number; version: number } | null {
  const version = Number(raw.version);
  const stepIndex = Number(raw.stepIndex);
  if (!Number.isFinite(stepIndex) || stepIndex < 0) return null;
  if (version === ONBOARDING_DRAFT_VERSION) {
    return { stepIndex: Math.round(stepIndex), version: ONBOARDING_DRAFT_VERSION };
  }
  if (version === ONBOARDING_DRAFT_VERSION_LEGACY) {
    return { stepIndex: migrateV2StepIndex(Math.round(stepIndex)), version: ONBOARDING_DRAFT_VERSION };
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
  if (!unitPreferences || !experienceLevel || !equipmentSetup || !profile) return null;

  const subscriptionTier = o.subscriptionTier === "free" || o.subscriptionTier === "pro" ? o.subscriptionTier : undefined;

  return {
    version: ONBOARDING_DRAFT_VERSION,
    stepIndex: Math.round(stepIndex),
    updatedAtIso,
    displayName,
    unitPreferences: unitPreferences as UnitPreferences,
    experienceLevel: experienceLevel as ExperienceLevel,
    equipmentSetup: equipmentSetup as EquipmentSetup,
    profile: profile as OnboardingProfile,
    draftTemplates: Array.isArray(o.draftTemplates) ? (o.draftTemplates as WorkoutRoutineTemplate[]) : undefined,
    macros: o.macros && typeof o.macros === "object" ? (o.macros as MacroTotals) : undefined,
    notificationPrefs:
      o.notificationPrefs && typeof o.notificationPrefs === "object"
        ? (o.notificationPrefs as NotificationPreferences)
        : undefined,
    subscriptionTier,
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

export function isRestorableOnboardingDraft(draft: OnboardingDraft | null | undefined): draft is OnboardingDraft {
  return draft != null && draft.version === ONBOARDING_DRAFT_VERSION && draft.stepIndex >= 0;
}

/** Read dedicated gymmy_onboarding_draft key; clears stale/wrong-version drafts. */
export function readGymmyOnboardingDraft(): OnboardingDraft | null {
  if (typeof localStorage === "undefined") return null;

  const persisted = loadPersistedSlice();
  if (persisted?.onboardingComplete === true) {
    clearGymmyOnboardingDraft();
    return null;
  }

  try {
    const raw = localStorage.getItem(GYMMY_ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = safeJsonParse<unknown>(raw, null, GYMMY_ONBOARDING_DRAFT_KEY);
    if (!parsed || typeof parsed !== "object") {
      clearGymmyOnboardingDraft();
      return null;
    }
    const version = Number((parsed as Record<string, unknown>).version);
    if (version !== ONBOARDING_DRAFT_VERSION && version !== ONBOARDING_DRAFT_VERSION_LEGACY) {
      console.warn(
        `[Gymmy onboarding] Draft version ${Number.isFinite(version) ? version : "?"} unsupported; starting fresh.`,
      );
      clearGymmyOnboardingDraft();
      return null;
    }
    const normalized = normalizeOnboardingDraft(parsed);
    if (!normalized) {
      clearGymmyOnboardingDraft();
      return null;
    }
    return normalized;
  } catch {
    clearGymmyOnboardingDraft();
    return null;
  }
}

/** Synchronous write to gymmy_onboarding_draft (survives refresh immediately). */
export function writeGymmyOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload = {
      ...draft,
      updatedAt: draft.updatedAtIso,
      updatedAtIso: draft.updatedAtIso,
    };
    localStorage.setItem(GYMMY_ONBOARDING_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearGymmyOnboardingDraft(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(GYMMY_ONBOARDING_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Remove draft from dedicated key and fitness persist slice. */
export function clearOnboardingDraftStorage(): void {
  clearGymmyOnboardingDraft();
  const existing = loadPersistedSlice();
  if (!existing?.onboardingDraft) return;
  savePersistedSlice({
    ...existing,
    onboardingDraft: null,
  } as PersistedFitnessSlice);
}

/**
 * Resolve restorable draft: dedicated localStorage key → in-memory state → fitness slice.
 * Never returns step 0-only drafts unless that is the saved index.
 */
export function loadRestorableOnboardingDraft(fromState: OnboardingDraft | null | undefined): OnboardingDraft | null {
  const fromDedicated = readGymmyOnboardingDraft();
  const fromSlice = normalizeOnboardingDraft(loadPersistedSlice()?.onboardingDraft);
  const fromMemory = isRestorableOnboardingDraft(fromState) ? fromState : null;
  const merged = mergeOnboardingDrafts(mergeOnboardingDrafts(fromDedicated, fromSlice), fromMemory);
  return isRestorableOnboardingDraft(merged) ? merged : null;
}

/** Dedicated key + fitness slice (for cloud sync). Always synchronous. */
export function saveOnboardingDraftToLocalStorage(draft: OnboardingDraft): void {
  writeGymmyOnboardingDraft(draft);
  const existing = loadPersistedSlice() ?? {};
  savePersistedSlice({
    ...existing,
    onboardingComplete: false,
    onboardingDraft: draft,
  } as PersistedFitnessSlice);
}

/** Initial wizard state read before React state — used by OnboardingFlow mount. */
export function initialOnboardingWizardDraft(fromState?: OnboardingDraft | null): OnboardingDraft | null {
  return loadRestorableOnboardingDraft(fromState ?? null);
}
