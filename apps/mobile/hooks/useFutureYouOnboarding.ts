import {
  mergeFutureYouDraft,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
} from "@newyouai/core";
import type { FutureYouDraft, OnboardingProfile } from "@newyouai/types";
import { useCallback, useRef, useState } from "react";

import {
  pickFutureYouPhotoFromCamera,
  pickFutureYouPhotoFromGallery,
} from "@/lib/futureYouPhotoPicker";
import {
  buildFutureYouGenerateProfile,
  FutureYouGenerateError,
  startFutureYouGeneration,
} from "@/lib/futureYouGenerateService";
import { futureYouTimelineFromProfile } from "@/lib/futureYouTimeline";
import { FutureYouUploadError, resolveFutureYouSourcePath, uploadFutureYouPhoto } from "@/lib/futureYouUploadService";

type WizardNav = {
  goToStep: (next: number, overrides?: { futureYou?: FutureYouDraft }) => void;
  patchFutureYou: (patch: Partial<FutureYouDraft>) => void;
  futureYou: FutureYouDraft | undefined;
  profile: OnboardingProfile;
};

export function useFutureYouOnboarding({ goToStep, patchFutureYou, futureYou, profile }: WizardNav) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const reuploadReturnStepRef = useRef(ONBOARDING_STEP_ACTIVITY);

  const futureYouSkippedDraft = useCallback(() => {
    return mergeFutureYouDraft(futureYou, {
      photoSkipped: true,
      photoUploaded: false,
      photoStoragePath: undefined,
      motivationId: undefined,
      motivationIsGeneric: undefined,
      generationStatus: "idle",
      generationJobId: undefined,
      onboardingGoalLocked: true,
    });
  }, [futureYou]);

  const skipFutureYouPhoto = useCallback(() => {
    setPhotoPreview(null);
    setUploadError(null);
    const nextFutureYou = futureYouSkippedDraft();
    goToStep(ONBOARDING_STEP_ACTIVITY, { futureYou: nextFutureYou });
  }, [futureYouSkippedDraft, goToStep]);

  const applyPhotoPreview = useCallback(
    (preview: string) => {
      setUploadError(null);
      setPhotoPreview(preview);
      const consentAt = futureYou?.photoAiConsentAt ?? new Date().toISOString();
      patchFutureYou({
        photoSkipped: false,
        photoUploaded: false,
        photoStoragePath: undefined,
        photoAiConsentAt: consentAt,
      });
    },
    [futureYou?.photoAiConsentAt, patchFutureYou],
  );

  const pickFromCamera = useCallback(async () => {
    const result = await pickFutureYouPhotoFromCamera();
    if (!result) return;
    if ("error" in result) {
      setUploadError(result.error);
      return;
    }
    applyPhotoPreview(result.preview);
  }, [applyPhotoPreview]);

  const pickFromGallery = useCallback(async () => {
    const result = await pickFutureYouPhotoFromGallery();
    if (!result) return;
    if ("error" in result) {
      setUploadError(result.error);
      return;
    }
    applyPhotoPreview(result.preview);
  }, [applyPhotoPreview]);

  const continueFutureYouPhoto = useCallback(
    async (
      previewOverride?: string,
      consentAtOverride?: string,
      returnStep?: number,
    ) => {
      if (returnStep !== undefined) {
        reuploadReturnStepRef.current = returnStep;
      }
      const preview = previewOverride ?? photoPreview;
      const consentAt = consentAtOverride ?? futureYou?.photoAiConsentAt;
      if (!preview || !consentAt) return;

      setUploadError(null);
      setUploading(true);
      try {
        const uploaded = await uploadFutureYouPhoto(preview);
        const nextFutureYou = mergeFutureYouDraft(futureYou, {
          photoSkipped: false,
          photoUploaded: true,
          photoAiConsentAt: consentAt,
          photoStoragePath: uploaded.path,
          onboardingGoalLocked: true,
        });
        goToStep(ONBOARDING_STEP_FUTURE_YOU_MOTIVATION, { futureYou: nextFutureYou });
      } catch (error) {
        const message =
          error instanceof FutureYouUploadError ?
            error.message
          : "Photo upload failed. Try again.";
        setUploadError(message);
      } finally {
        setUploading(false);
      }
    },
    [futureYou, goToStep, photoPreview],
  );

  const continueFutureYouMotivation = useCallback(async (returnStep?: number) => {
    const motivationId = futureYou?.motivationId?.trim();
    if (!motivationId || generating) return;

    const targetStep = returnStep ?? reuploadReturnStepRef.current ?? ONBOARDING_STEP_ACTIVITY;

    if (
      futureYou?.generationJobId &&
      futureYou.generationStatus &&
      futureYou.generationStatus !== "idle" &&
      futureYou.generationStatus !== "failed"
    ) {
      goToStep(targetStep);
      return;
    }

    setGenerateError(null);
    setGenerating(true);
    try {
      const sourcePath = await resolveFutureYouSourcePath({
        photoStoragePath: futureYou?.photoStoragePath,
        photoPreview,
      });
      const generateProfile = buildFutureYouGenerateProfile(profile);
      const timeline = futureYouTimelineFromProfile(profile);
      const result = await startFutureYouGeneration({
        sourcePath,
        motivationId,
        profile: generateProfile,
        timeline,
      });
      const nextFutureYou = mergeFutureYouDraft(futureYou, {
        motivationId,
        motivationIsGeneric: futureYou?.motivationIsGeneric,
        photoStoragePath: sourcePath,
        photoUploaded: true,
        generationJobId: result.jobId,
        generationStatus: result.status,
        generationError: undefined,
        generationReadyAt: undefined,
        generationAutoRetried: false,
        generationRetrying: false,
      });
      setPhotoPreview(null);
      goToStep(targetStep, { futureYou: nextFutureYou });
    } catch (error) {
      const message =
        error instanceof FutureYouGenerateError ? error.message
        : error instanceof FutureYouUploadError ? error.message
        : "Could not start generation. Try again.";
      if (/source photo not found/i.test(message)) {
        patchFutureYou({ photoStoragePath: undefined, photoUploaded: false });
      }
      setGenerateError(message);
    } finally {
      setGenerating(false);
    }
  }, [futureYou, generating, goToStep, patchFutureYou, photoPreview, profile]);

  const retryFutureYouGeneration = useCallback(async () => {
    const motivationId = futureYou?.motivationId?.trim();
    if (!motivationId) {
      throw new FutureYouGenerateError("Could not start generation. Try again.", "invalid");
    }

    const sourcePath = await resolveFutureYouSourcePath({
      photoStoragePath: futureYou?.photoStoragePath,
      photoPreview,
    });
    const generateProfile = buildFutureYouGenerateProfile(profile);
    const timeline = futureYouTimelineFromProfile(profile);
    const result = await startFutureYouGeneration({
      sourcePath,
      motivationId,
      profile: generateProfile,
      timeline,
    });
    patchFutureYou({
      motivationId,
      motivationIsGeneric: futureYou?.motivationIsGeneric,
      photoStoragePath: sourcePath,
      photoUploaded: true,
      generationJobId: result.jobId,
      generationStatus: result.status,
      generationError: undefined,
      generationReadyAt: undefined,
      generationRetrying: false,
    });
  }, [futureYou, patchFutureYou, photoPreview, profile]);

  const startFutureYouReupload = useCallback(
    (returnStep: number) => {
      reuploadReturnStepRef.current = returnStep;
      setPhotoPreview(null);
      setUploadError(null);
      setGenerateError(null);
      // photoSkipped:true is the only state that satisfies canRevisitFutureYouPhoto,
      // which the navigation guard requires to re-enter the goal-locked photo step.
      // Uploading a new photo resets photoSkipped back to false.
      const nextFutureYou = mergeFutureYouDraft(futureYou, {
        photoSkipped: true,
        generationStatus: "idle",
        generationJobId: undefined,
        generationError: undefined,
        generationAutoRetried: false,
        generationRetrying: false,
        generationReadyAt: undefined,
        photoStoragePath: undefined,
        photoUploaded: false,
      });
      goToStep(ONBOARDING_STEP_FUTURE_YOU_PHOTO, { futureYou: nextFutureYou });
    },
    [futureYou, goToStep],
  );

  const clearPhoto = useCallback(() => {
    setPhotoPreview(null);
    setUploadError(null);
    patchFutureYou({ photoUploaded: false, photoStoragePath: undefined });
  }, [patchFutureYou]);

  const grantAiConsent = useCallback(() => {
    if (!futureYou?.photoAiConsentAt) {
      patchFutureYou({ photoAiConsentAt: new Date().toISOString() });
    }
  }, [futureYou?.photoAiConsentAt, patchFutureYou]);

  const selectMotivation = useCallback(
    (motivationId: string, isGeneric: boolean) => {
      setGenerateError(null);
      patchFutureYou({ motivationId, motivationIsGeneric: isGeneric });
    },
    [patchFutureYou],
  );

  return {
    photoPreview,
    uploading,
    uploadError,
    generating,
    generateError,
    skipFutureYouPhoto,
    pickFromCamera,
    pickFromGallery,
    continueFutureYouPhoto,
    continueFutureYouMotivation,
    retryFutureYouGeneration,
    startFutureYouReupload,
    clearPhoto,
    grantAiConsent,
    selectMotivation,
    setGenerateError,
  };
}
