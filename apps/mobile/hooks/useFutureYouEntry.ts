import { useMemo } from "react";

import { getHomeFutureYouEntryMode } from "@/lib/homeFutureYouModel";
import { ageFromDateOfBirth } from "@/lib/onboardingProfile";
import type { AppState } from "@newyouai/types";

const FUTURE_YOU_MIN_AGE = 18;
const FUTURE_YOU_MAX_AGE = 80;

function isFutureYouPhotoBlocked(age: number | null): boolean {
  if (age == null) return false;
  return age < FUTURE_YOU_MIN_AGE || age > FUTURE_YOU_MAX_AGE;
}

/** Shared Future You entry state for Home header chip. */
export function useFutureYouEntry(state: AppState | null, enabled = true) {
  const futureYouAge = useMemo(() => {
    const profile = state?.onboardingProfile;
    if (!profile) return null;
    if (profile.dateOfBirth) return ageFromDateOfBirth(profile.dateOfBirth);
    return profile.age ?? null;
  }, [state?.onboardingProfile]);

  const photoBlocked = isFutureYouPhotoBlocked(futureYouAge);
  const mode =
    enabled && state
      ? getHomeFutureYouEntryMode(
          state.futureYou,
          photoBlocked,
          state.subscriptionTier,
          state.onboardingComplete,
        )
      : null;

  return {
    mode,
    photoBlocked,
  };
}
