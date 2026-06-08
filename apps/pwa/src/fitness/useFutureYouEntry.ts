import { useMemo } from "react";

import { isFutureYouPhotoBlocked } from "./futureYouAge";
import { getHomeFutureYouEntryMode } from "./homeFutureYouModel";
import { futureYouTimelineFromProfile } from "./futureYouTimeline";
import { ageFromDateOfBirth } from "./onboardingProfile";
import { useFutureYouRevealImage } from "./useFutureYouRevealImage";
import type { AppState } from "./types";

/** Shared Future You entry state for Home header chip and Progress tab. */
export function useFutureYouEntry(state: AppState, enabled = true) {
  const futureYouAge = useMemo(() => {
    const profile = state.onboardingProfile;
    if (!profile) return null;
    if (profile.dateOfBirth) return ageFromDateOfBirth(profile.dateOfBirth);
    return profile.age ?? null;
  }, [state.onboardingProfile]);

  const photoBlocked = isFutureYouPhotoBlocked(futureYouAge);
  const mode =
    enabled ?
      getHomeFutureYouEntryMode(
        state.futureYou,
        photoBlocked,
        state.subscriptionTier,
        state.onboardingComplete,
      )
    : null;
  const timeline = futureYouTimelineFromProfile(state.onboardingProfile ?? { goal: "cut", weightLbs: 180 });
  const generationStatus = state.futureYou?.generationStatus ?? "idle";
  const { imageSrc: thumbnailSrc, loading: thumbnailLoading } = useFutureYouRevealImage({
    jobId: state.futureYou?.generationJobId,
    gender: state.onboardingProfile?.gender,
    status: generationStatus,
    subscriptionTier: state.subscriptionTier,
    previewMode: false,
  });

  return {
    mode,
    timeline,
    photoBlocked,
    futureYouAge,
    generationStatus,
    thumbnailSrc,
    thumbnailLoading,
    motivationId: state.futureYou?.motivationId,
    gender: state.onboardingProfile?.gender,
    profile: state.onboardingProfile ?? { goal: "cut" as const, weightLbs: 180 },
  };
}
