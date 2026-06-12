import {
  mergeFutureYouDraft,
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
} from "@newyouai/core";
import type { FutureYouDraft, OnboardingProfile } from "@newyouai/types";
import { useCallback, useState } from "react";

import { compressImageToJpegDataUrl } from "@/lib/imageCompress";
import {
  buildFutureYouGenerateProfile,
  FutureYouGenerateError,
  startFutureYouGeneration,
} from "@/lib/futureYouGenerateService";
import { futureYouTimelineFromProfile } from "@/lib/futureYouTimeline";
import { FutureYouUploadError, uploadFutureYouPhoto } from "@/lib/futureYouUploadService";

type WizardNav = {
  goToStep: (next: number, overrides?: { futureYou?: FutureYouDraft }) => void;
  patchFutureYou: (patch: Partial<FutureYouDraft>) => void;
  futureYou: FutureYouDraft | undefined;
  profile: OnboardingProfile;
};

function permissionDeniedMessage(kind: "camera" | "gallery"): string {
  return kind === "camera" ?
      "Camera access is off. Enable it in Settings or choose from gallery — or skip for now."
    : "Photo library access is off. Enable it in Settings or use the camera — or skip for now.";
}

export function useFutureYouOnboarding({ goToStep, patchFutureYou, futureYou, profile }: WizardNav) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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

  const onPickImageUri = useCallback(
    async (uri: string) => {
      setUploadError(null);
      try {
        const preview = await compressImageToJpegDataUrl(uri);
        setPhotoPreview(preview);
        const consentAt = futureYou?.photoAiConsentAt ?? new Date().toISOString();
        patchFutureYou({
          photoSkipped: false,
          photoUploaded: false,
          photoStoragePath: undefined,
          photoAiConsentAt: consentAt,
        });
      } catch {
        setUploadError("Could not read that photo. Try another image.");
      }
    },
    [futureYou?.photoAiConsentAt, patchFutureYou],
  );

  const pickFromCamera = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setUploadError(permissionDeniedMessage("camera"));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]?.uri) return;
      await onPickImageUri(result.assets[0].uri);
    } catch {
      setUploadError(permissionDeniedMessage("camera"));
    }
  }, [onPickImageUri]);

  const pickFromGallery = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setUploadError(permissionDeniedMessage("gallery"));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]?.uri) return;
      await onPickImageUri(result.assets[0].uri);
    } catch {
      setUploadError(permissionDeniedMessage("gallery"));
    }
  }, [onPickImageUri]);

  const continueFutureYouPhoto = useCallback(
    async (previewOverride?: string, consentAtOverride?: string) => {
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

  const continueFutureYouMotivation = useCallback(async () => {
    const motivationId = futureYou?.motivationId?.trim();
    if (!motivationId || !futureYou?.photoStoragePath || generating) return;

    if (
      futureYou.generationJobId &&
      futureYou.generationStatus &&
      futureYou.generationStatus !== "idle" &&
      futureYou.generationStatus !== "failed"
    ) {
      goToStep(ONBOARDING_STEP_ACTIVITY);
      return;
    }

    setGenerateError(null);
    setGenerating(true);
    try {
      const generateProfile = buildFutureYouGenerateProfile(profile);
      const timeline = futureYouTimelineFromProfile(profile);
      const result = await startFutureYouGeneration({
        sourcePath: futureYou.photoStoragePath,
        motivationId,
        profile: generateProfile,
        timeline,
      });
      const nextFutureYou = mergeFutureYouDraft(futureYou, {
        motivationId,
        motivationIsGeneric: futureYou.motivationIsGeneric,
        generationJobId: result.jobId,
        generationStatus: result.status,
      });
      goToStep(ONBOARDING_STEP_ACTIVITY, { futureYou: nextFutureYou });
    } catch (error) {
      const message =
        error instanceof FutureYouGenerateError ?
          error.message
        : "Could not start generation. Try again.";
      setGenerateError(message);
    } finally {
      setGenerating(false);
    }
  }, [futureYou, generating, goToStep, profile]);

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
    clearPhoto,
    grantAiConsent,
    selectMotivation,
    setGenerateError,
  };
}
