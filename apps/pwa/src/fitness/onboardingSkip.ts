import { clearOnboardingDraftStorage } from "./onboardingDraft";
import { savePersistedSlice, type PersistedFitnessSlice } from "./persistFitnessSlice";
import { hasExistingFitnessData as hasExistingFitnessDataCore } from "@newyouai/core";

export function legacyUserEmails(): string[] {
  const raw = import.meta.env.VITE_LEGACY_USER_EMAILS;
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  const devSkip = import.meta.env.VITE_DEV_SKIP_EMAIL;
  if (typeof devSkip === "string" && devSkip.trim()) {
    return [devSkip.trim().toLowerCase()];
  }
  return [];
}

export function isLegacyUserEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return legacyUserEmails().includes(email.trim().toLowerCase());
}

export function hasExistingFitnessData(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  return hasExistingFitnessDataCore(p);
}

/** Profile + setup flags saved during onboarding, even if onboardingComplete never synced. */
export function hasOnboardingProfileSetup(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  if (!p) return false;
  if (p.onboardingComplete === true) return true;
  const choseSetup =
    p.experienceLevelChosen === true &&
    p.equipmentSetupChosen === true &&
    (p.unitPreferencesChosen === true || p.unitPreferences != null);
  return choseSetup && p.onboardingProfile != null;
}

export function shouldSkipOnboarding(opts: {
  persisted: Partial<PersistedFitnessSlice> | null | undefined;
  sessionEmail?: string | null | undefined;
  forcePreview?: boolean;
}): boolean {
  if (opts.forcePreview) return false;
  if (opts.persisted?.onboardingComplete === true) return true;
  if (hasOnboardingProfileSetup(opts.persisted)) return true;
  if (isLegacyUserEmail(opts.sessionEmail)) return true;
  return hasExistingFitnessData(opts.persisted);
}

/** After a valid sign-in (or restored session), persist onboarding bypass and clear draft keys. */
export function finalizeSignedInAppAccess(
  base: Partial<PersistedFitnessSlice> | null | undefined,
): PersistedFitnessSlice {
  clearOnboardingDraftStorage();
  const nextSlice = {
    ...(base ?? {}),
    onboardingComplete: true,
    onboardingDraft: null,
  } as PersistedFitnessSlice;
  savePersistedSlice(nextSlice);
  return nextSlice;
}
