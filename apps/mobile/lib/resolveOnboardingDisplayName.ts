import type { User } from "@supabase/supabase-js";

import { displayNameFromUser } from "@/lib/displayNameFromUser";

/** Copy-only fallback when no name is known yet (never persist this). */
export const ONBOARDING_DISPLAY_NAME_FALLBACK = "Friend";

function isPlaceholderDisplayName(name: string): boolean {
  return name.trim().toLowerCase() === ONBOARDING_DISPLAY_NAME_FALLBACK.toLowerCase();
}

/** Prefer wizard draft, then auth metadata, then persisted fitness slice. */
export function resolveOnboardingDisplayName(input: {
  wizardDisplayName?: string;
  sessionUser?: User | null;
  fitnessDisplayName?: string | null;
}): string {
  const wizard = input.wizardDisplayName?.trim() ?? "";
  if (wizard && !isPlaceholderDisplayName(wizard)) return wizard;

  const fromAuth = displayNameFromUser(input.sessionUser);
  if (fromAuth) return fromAuth;

  const fromFitness = input.fitnessDisplayName?.trim() ?? "";
  if (fromFitness && !isPlaceholderDisplayName(fromFitness)) return fromFitness;

  return wizard;
}

/** UI copy when `resolveOnboardingDisplayName` returns empty. */
export function onboardingDisplayNameForCopy(resolvedName: string): string {
  return resolvedName.trim() || ONBOARDING_DISPLAY_NAME_FALLBACK;
}
