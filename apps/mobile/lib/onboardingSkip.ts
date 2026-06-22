import {
  hasExistingFitnessData,
  hasOnboardingProfileSetup,
  isLegacyUserEmail,
  shouldSkipOnboarding as shouldSkipOnboardingCore,
} from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

export { hasExistingFitnessData, hasOnboardingProfileSetup, isLegacyUserEmail };

function envTrim(raw: string | undefined): string {
  return String(raw ?? "").trim();
}

/** Comma-separated legacy emails — same semantics as PWA `VITE_LEGACY_USER_EMAILS`. */
export function legacyUserEmails(): string[] {
  const raw = envTrim(process.env.EXPO_PUBLIC_LEGACY_USER_EMAILS);
  if (raw) {
    return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  const devSkip = envTrim(process.env.EXPO_PUBLIC_DEV_SKIP_EMAIL);
  if (devSkip) return [devSkip.trim().toLowerCase()];
  return [];
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
