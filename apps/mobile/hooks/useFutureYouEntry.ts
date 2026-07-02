import { useMemo } from "react";

import { isFutureYouRegionBlocked } from "@newyouai/core";
import { useFutureYouGalleryImages } from "@/hooks/useFutureYouGalleryImages";
import { useFutureYouRevealImage } from "@/hooks/useFutureYouRevealImage";
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
  const regionBlocked = isFutureYouRegionBlocked(state?.onboardingProfile);
  const mode =
    enabled && state
      ? getHomeFutureYouEntryMode(
          state.futureYou,
          photoBlocked,
          regionBlocked,
          state.subscriptionTier,
          state.onboardingComplete,
        )
      : null;

  const generationStatus = state?.futureYou?.generationStatus ?? "idle";
  const shouldPrefetchImage = enabled && mode === "reveal" && Boolean(state?.futureYou?.generationJobId?.trim());

  useFutureYouRevealImage({
    jobId: shouldPrefetchImage ? state?.futureYou?.generationJobId : undefined,
    status: shouldPrefetchImage ? generationStatus : "idle",
    subscriptionTier: state?.subscriptionTier,
    previewMode: false,
  });

  // Warm the signed URLs + image cache for every kept preview on app open so opening the
  // NewYou gallery / a detail view is instant.
  useFutureYouGalleryImages(enabled ? state?.futureYou?.previews : undefined, state?.subscriptionTier);

  return {
    mode,
    photoBlocked,
    regionBlocked,
  };
}
