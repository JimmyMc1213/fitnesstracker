import type { PersistedFitnessSlice } from "./persistFitnessSlice";

const DEFAULT_LEGACY_EMAILS = ["jimmymccarthy@gmail.com"];

export function legacyUserEmails(): string[] {
  const raw = import.meta.env.VITE_LEGACY_USER_EMAILS;
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return DEFAULT_LEGACY_EMAILS.map((e) => e.toLowerCase());
}

export function isLegacyUserEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return legacyUserEmails().includes(email.trim().toLowerCase());
}

export function hasExistingFitnessData(p: Partial<PersistedFitnessSlice> | null | undefined): boolean {
  if (!p) return false;
  return Object.keys(p.workoutsCompletedByDay ?? {}).length > 0 || (p.weightLog?.length ?? 0) > 0;
}

export function shouldSkipOnboarding(opts: {
  persisted: Partial<PersistedFitnessSlice> | null | undefined;
  sessionEmail: string | null | undefined;
  forcePreview?: boolean;
}): boolean {
  if (opts.forcePreview) return false;
  if (opts.persisted?.onboardingComplete === true) return true;
  if (isLegacyUserEmail(opts.sessionEmail)) return true;
  return hasExistingFitnessData(opts.persisted);
}
