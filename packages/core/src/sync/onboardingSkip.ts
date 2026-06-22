import type { PersistedFitnessSlice } from "@newyouai/types";

export function hasExistingFitnessData(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  if (!p) return false;
  return Object.keys(p.workoutsCompletedByDay ?? {}).length > 0 || (p.weightLog?.length ?? 0) > 0;
}

/** Profile + setup flags saved during onboarding, even if onboardingComplete never synced. */
export function hasOnboardingProfileSetup(
  p: Partial<PersistedFitnessSlice> | null | undefined,
): boolean {
  if (!p) return false;
  if (p.onboardingComplete === true) return true;
  const choseSetup =
    p.experienceLevelChosen === true &&
    p.equipmentSetupChosen === true &&
    (p.unitPreferencesChosen === true || p.unitPreferences != null);
  return choseSetup && p.onboardingProfile != null;
}

export function isLegacyUserEmail(
  email: string | null | undefined,
  legacyEmails: readonly string[],
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return legacyEmails.some((entry) => entry.trim().toLowerCase() === normalized);
}

export function shouldSkipOnboarding(opts: {
  persisted: Partial<PersistedFitnessSlice> | null | undefined;
  sessionEmail?: string | null | undefined;
  legacyEmails?: readonly string[];
  forcePreview?: boolean;
}): boolean {
  if (opts.forcePreview) return false;
  if (opts.persisted?.onboardingComplete === true) return true;
  if (hasOnboardingProfileSetup(opts.persisted)) return true;
  if (isLegacyUserEmail(opts.sessionEmail, opts.legacyEmails ?? [])) return true;
  return hasExistingFitnessData(opts.persisted);
}
