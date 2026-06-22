import {
  hasExistingFitnessData,
  hasOnboardingProfileSetup,
  isLegacyUserEmail as isLegacyUserEmailCore,
  shouldSkipOnboarding as shouldSkipOnboardingCore,
} from "@newyouai/core";
import { clearOnboardingDraftStorage } from "./onboardingDraft";
import { savePersistedSlice, type PersistedFitnessSlice } from "./persistFitnessSlice";

export { hasExistingFitnessData, hasOnboardingProfileSetup };

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
  return isLegacyUserEmailCore(email, legacyUserEmails());
}

export function shouldSkipOnboarding(opts: {
  persisted: Partial<PersistedFitnessSlice> | null | undefined;
  sessionEmail?: string | null | undefined;
  forcePreview?: boolean;
}): boolean {
  return shouldSkipOnboardingCore({
    ...opts,
    legacyEmails: legacyUserEmails(),
  });
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
