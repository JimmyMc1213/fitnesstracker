import {
  buildFutureYouGalleryItem,
  canRedoFutureYouTransformation,
  FUTURE_YOU_PAGE_BLOCKED_LEDE,
  futureYouDraftAfterPreviewDelete,
  futureYouPageLede,
  futureYouPageRedoLede,
  futureYouRedoAnchorIso,
  futureYouTimelineFromProfile,
  homeFutureYouMotivationLabel,
  mergeFutureYouDraft,
  msUntilFutureYouRedoEligible,
  shouldPromptFutureYouReplaceDialog,
  shouldShowFutureYouGalleryTile,
  type FutureYouGalleryItem,
} from "@newyouai/core";
import type { FutureYouDraft, FutureYouPreview } from "@newyouai/types";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, ScrollView, View } from "react-native";

import { FutureYouDetailView } from "@/components/future-you/FutureYouDetailView";
import { FutureYouGalleryView } from "@/components/future-you/FutureYouGalleryView";
import { FutureYouReplaceDialog } from "@/components/future-you/FutureYouReplaceDialog";
import {
  FutureYouNewPicView,
  type FutureYouNewPicStep,
} from "@/components/future-you/FutureYouNewPicView";
import { FutureYouNewChip } from "@/components/future-you/FutureYouNewChip";
import { ScreenHeader } from "@/components/home/ScreenHeader";
import { useFitnessState } from "@/context/FitnessContext";
import { useWorkoutShell } from "@/context/WorkoutShellContext";
import { useFutureYouEntry } from "@/hooks/useFutureYouEntry";
import { useFutureYouGalleryImages } from "@/hooks/useFutureYouGalleryImages";
import { useFutureYouGenerationPoll } from "@/hooks/useFutureYouGenerationPoll";
import { useFutureYouRevealImage } from "@/hooks/useFutureYouRevealImage";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";
import {
  buildFutureYouGenerateProfile,
  FutureYouGenerateError,
  startFutureYouGeneration,
} from "@/lib/futureYouGenerateService";
import { deleteFutureYou } from "@/lib/futureYouDeleteService";
import {
  cacheFutureYouResultUrl,
  preloadFutureYouImage,
} from "@/lib/futureYouImagePreload";
import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import {
  FUTURE_YOU_READY_NOTIFICATION_BODY,
  FUTURE_YOU_READY_NOTIFICATION_TITLE,
  presentFutureYouReadyNotification,
} from "@/lib/futureYouReadyNotification";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";
import {
  pickFutureYouPhotoFromCamera,
  pickFutureYouPhotoFromGallery,
} from "@/lib/futureYouPhotoPicker";
import { ageFromDateOfBirth } from "@/lib/onboardingProfile";
import { FutureYouUploadError, resolveFutureYouSourcePath, uploadFutureYouPhoto } from "@/lib/futureYouUploadService";
import { isFutureYouSkipCooldownEnabled } from "@/lib/futureYouDevFlags";

type PageView = "gallery" | "detail" | "upload";

/** Photo + motivation fields preserved when replacing an existing preview. */
function futureYouUploadSnapshot(draft: FutureYouDraft): FutureYouDraft {
  const snap: FutureYouDraft = { photoSkipped: false };
  if (draft.photoUploaded === true) snap.photoUploaded = true;
  if (draft.photoAiConsentAt?.trim()) snap.photoAiConsentAt = draft.photoAiConsentAt.trim();
  if (draft.photoStoragePath?.trim()) snap.photoStoragePath = draft.photoStoragePath.trim();
  if (draft.motivationId?.trim()) snap.motivationId = draft.motivationId.trim();
  if (draft.motivationIsGeneric === true) snap.motivationIsGeneric = true;
  if (draft.onboardingGoalLocked === true) snap.onboardingGoalLocked = true;
  return snap;
}

export function FutureYouScreen() {
  const { colors } = useAppTheme();
  const { setFutureYouFlowOpen } = useWorkoutShell();
  const { state, setFitnessState } = useFitnessState();
  const params = useLocalSearchParams<{ openFutureYouUpload?: string; openFutureYouDetail?: string }>();
  const handledOpenUploadRef = useRef(false);
  const handledOpenDetailRef = useRef(false);
  const awaitingUploadGenerationRef = useRef(false);

  const [view, setView] = useState<PageView>("gallery");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [redoCountdownTick, setRedoCountdownTick] = useState(0);
  const [tabFocused, setTabFocused] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [replaceBusy, setReplaceBusy] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [replacePendingGenerate, setReplacePendingGenerate] = useState(false);
  const [uploadStep, setUploadStep] = useState<FutureYouNewPicStep>("photo");
  const flowOpen = view === "upload" || view === "detail";
  const { paddingTop, paddingBottom } = useTabScreenInsets({ tabBarHidden: flowOpen });

  useEffect(() => {
    setFutureYouFlowOpen(flowOpen);
    return () => setFutureYouFlowOpen(false);
  }, [flowOpen, setFutureYouFlowOpen]);

  useFocusEffect(
    useCallback(() => {
      setTabFocused(true);
      return () => setTabFocused(false);
    }, []),
  );

  const { mode, photoBlocked } = useFutureYouEntry(state);
  const profile = state?.onboardingProfile;
  const draft = state?.futureYou ?? {};
  const gender = profile?.gender;
  const age = useMemo(() => {
    if (!profile) return null;
    if (profile.dateOfBirth) return ageFromDateOfBirth(profile.dateOfBirth);
    return profile.age ?? null;
  }, [profile]);
  const subscriptionTier = state?.subscriptionTier;
  const timeline = profile ? futureYouTimelineFromProfile(profile) : "3 months";
  const motivationLabel = homeFutureYouMotivationLabel(draft.motivationId);

  const onFutureYouPatch = useCallback(
    (patch: Parameters<typeof mergeFutureYouDraft>[1]) => {
      setFitnessState((prev) => ({
        ...prev,
        futureYou: mergeFutureYouDraft(prev.futureYou, patch),
      }));
    },
    [setFitnessState],
  );

  const draftGenerationStatus = draft.generationStatus ?? "idle";
  const uploadJobActive =
    Boolean(draft.generationJobId?.trim()) &&
    (draftGenerationStatus === "queued" || draftGenerationStatus === "generating");

  const generationStatus = useFutureYouGenerationPoll({
    futureYou: draft,
    onFutureYouPatch: onFutureYouPatch,
    // Keep polling whenever a job is active (incl. on the gallery, so leaving the
    // generating screen still resolves the result), or while viewing a preview.
    pollEnabled: tabFocused && (mode === "reveal" || view === "detail" || uploadJobActive),
    onGenerationFailed: (message) => {
      setGenerateError(message);
      if (/source photo not found/i.test(message)) {
        onFutureYouPatch({ photoStoragePath: undefined, photoUploaded: false });
        setUploadStep("photo");
        setView("upload");
      }
    },
  });

  const generationActive =
    generationStatus === "queued" || generationStatus === "generating";

  const { imageUri, loading: revealImageLoading } = useFutureYouRevealImage({
    jobId: draft.generationJobId,
    status: generationStatus,
    subscriptionTier,
  });

  const revealLoading =
    revealImageLoading || generationStatus === "queued" || generationStatus === "generating";

  const skipRedoCooldown = isFutureYouSkipCooldownEnabled();
  const redoAnchorIso = futureYouRedoAnchorIso(draft);
  const msUntilRedo = useMemo(
    () => msUntilFutureYouRedoEligible(redoAnchorIso),
    [redoAnchorIso, redoCountdownTick],
  );
  const canRedo = canRedoFutureYouTransformation(
    mode,
    generationStatus,
    redoAnchorIso,
    false,
    Date.now(),
    skipRedoCooldown,
  );
  const shouldPromptReplace = shouldPromptFutureYouReplaceDialog(
    mode,
    generationStatus,
    redoAnchorIso,
    false,
    Date.now(),
    skipRedoCooldown,
  );
  const pageLede = photoBlocked ? FUTURE_YOU_PAGE_BLOCKED_LEDE : futureYouPageLede(mode);
  const pageRedoLede = futureYouPageRedoLede(msUntilRedo, skipRedoCooldown);

  const galleryItem = useMemo(
    () =>
      buildFutureYouGalleryItem({
        jobId: draft.generationJobId,
        imageSrc: imageUri,
        timeline,
        motivationLabel,
        readyAtIso: draft.generationReadyAt,
        loading: revealLoading,
      }),
    [
      draft.generationJobId,
      draft.generationReadyAt,
      imageUri,
      timeline,
      motivationLabel,
      revealLoading,
    ],
  );

  const previewImages = useFutureYouGalleryImages(draft.previews, subscriptionTier);

  const previewItems = useMemo((): FutureYouGalleryItem[] => {
    const previews = draft.previews ?? [];
    return previews
      .map((preview) => {
        const resolved = previewImages[preview.jobId];
        return buildFutureYouGalleryItem({
          jobId: preview.jobId,
          imageSrc: resolved?.uri ?? null,
          timeline: preview.timeline ?? timeline,
          motivationLabel: homeFutureYouMotivationLabel(preview.motivationId),
          readyAtIso: preview.readyAt,
          loading: resolved?.loading ?? true,
        });
      })
      .filter((item): item is FutureYouGalleryItem => item !== null);
  }, [draft.previews, previewImages, timeline]);

  const galleryItems = useMemo((): FutureYouGalleryItem[] => {
    const activeItem =
      shouldShowFutureYouGalleryTile(mode, generationStatus) && galleryItem ? galleryItem : null;
    return [activeItem, ...previewItems].filter(
      (item): item is FutureYouGalleryItem => item !== null,
    );
  }, [mode, generationStatus, galleryItem, previewItems]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return galleryItems[0] ?? null;
    return galleryItems.find((item) => item.id === selectedItemId) ?? galleryItems[0] ?? null;
  }, [galleryItems, selectedItemId]);

  const saveableImageUri = generationStatus === "ready" ? imageUri : null;

  const detailItem = useMemo((): FutureYouGalleryItem | null => {
    if (!selectedItem) return null;
    const isActiveJob = selectedItem.id === draft.generationJobId?.trim();
    if (isActiveJob) {
      return {
        ...selectedItem,
        imageSrc:
          selectedItem.loading ? selectedItem.imageSrc : saveableImageUri ?? selectedItem.imageSrc,
        loading: revealLoading,
      };
    }
    const resolved = previewImages[selectedItem.id];
    return {
      ...selectedItem,
      imageSrc: resolved?.uri ?? selectedItem.imageSrc,
      loading: resolved?.loading ?? false,
    };
  }, [selectedItem, saveableImageUri, revealLoading, draft.generationJobId, previewImages]);

  const detailSourcePhotoPath = useMemo(() => {
    if (!detailItem) return undefined;
    const isActiveJob = detailItem.id === draft.generationJobId?.trim();
    if (isActiveJob) return draft.photoStoragePath?.trim();
    return draft.previews?.find((preview) => preview.jobId === detailItem.id)?.sourcePhotoPath?.trim();
  }, [detailItem, draft.generationJobId, draft.photoStoragePath, draft.previews]);

  useEffect(() => {
    if (msUntilRedo <= 0) return;
    const intervalMs = msUntilRedo < 48 * 60 * 60 * 1000 ? 60_000 : 60 * 60_000;
    const id = setInterval(() => setRedoCountdownTick((n) => n + 1), intervalMs);
    return () => clearInterval(id);
  }, [msUntilRedo]);

  useEffect(() => {
    if (view === "detail" && galleryItems.length === 0) {
      setView("gallery");
      setSelectedItemId(null);
    }
  }, [view, galleryItems.length]);

  useEffect(() => {
    const jobId = draft.generationJobId?.trim();
    if (!tabFocused || generationStatus !== "ready" || !jobId || draft.generationReadyAt) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await pollFutureYouJobStatus(jobId);
        if (cancelled || response.status !== "ready") return;
        onFutureYouPatch({ generationReadyAt: response.updatedAt });
      } catch (error) {
        if (cancelled || !(error instanceof FutureYouPollError)) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    tabFocused,
    generationStatus,
    draft.generationJobId,
    draft.generationReadyAt,
    onFutureYouPatch,
  ]);

  const openUploadPage = useCallback(() => {
    if (photoBlocked) return;
    setPhotoPreview(null);
    setUploadError(null);
    setGenerateError(null);
    setUploadStep("photo");
    awaitingUploadGenerationRef.current = false;
    // Drop the onboarding/previous-session storage path so the photo step starts
    // empty instead of showing "Remove photo" with no preview.
    onFutureYouPatch({
      photoUploaded: false,
      photoStoragePath: undefined,
      ...(draft.generationStatus === "failed" ? { generationStatus: "idle" as const } : {}),
    });
    setView("upload");
  }, [photoBlocked, draft.generationStatus, onFutureYouPatch]);

  useEffect(() => {
    if (params.openFutureYouUpload !== "1") return;
    if (handledOpenUploadRef.current) return;
    handledOpenUploadRef.current = true;
    if (!photoBlocked) {
      openUploadPage();
    }
  }, [params.openFutureYouUpload, photoBlocked, openUploadPage]);

  useEffect(() => {
    if (params.openFutureYouDetail !== "1") return;
    if (handledOpenDetailRef.current) return;
    if (galleryItems.length === 0) return;
    handledOpenDetailRef.current = true;
    setSelectedItemId(galleryItems[0]?.id ?? null);
    setView("detail");
  }, [params.openFutureYouDetail, galleryItems]);

  const closeUploadPage = useCallback(() => {
    setView("gallery");
    setPhotoPreview(null);
    setUploadError(null);
    setGenerateError(null);
    setUploadStep("photo");
    awaitingUploadGenerationRef.current = false;
  }, []);

  const onDetailFutureYouDeleted = useCallback(
    (jobId: string) => {
      setView("gallery");
      setSelectedItemId(null);
      setFitnessState((prev) => {
        const next = futureYouDraftAfterPreviewDelete(prev.futureYou, jobId);
        return {
          ...prev,
          futureYou: Object.keys(next).length > 0 ? next : undefined,
        };
      });
    },
    [setFitnessState],
  );

  const executeGeneration = useCallback(
    async (fromDraft: FutureYouDraft) => {
      const motivationId = fromDraft.motivationId?.trim();
      if (!motivationId || !profile) return;

      setGenerateError(null);
      setGenerating(true);
      try {
        const sourcePath = await resolveFutureYouSourcePath({
          photoStoragePath: fromDraft.photoStoragePath,
          photoPreview,
        });
        onFutureYouPatch({
          photoStoragePath: sourcePath,
          photoUploaded: true,
          photoSkipped: false,
        });

        const generateProfile = buildFutureYouGenerateProfile(profile);
        const result = await startFutureYouGeneration({
          sourcePath,
          motivationId,
          profile: generateProfile,
          timeline,
        });
        onFutureYouPatch({
          motivationId,
          motivationIsGeneric: fromDraft.motivationIsGeneric,
          generationJobId: result.jobId,
          generationStatus: result.status,
          photoSkipped: false,
        });
        if (result.status === "ready") {
          try {
            const poll = await pollFutureYouJobStatus(result.jobId);
            const resultUrl = futureYouPollImageUrl(poll, true);
            if (resultUrl) {
              cacheFutureYouResultUrl(result.jobId, resultUrl);
              void preloadFutureYouImage(resultUrl).catch(() => undefined);
            }
          } catch {
            // Poll hook will retry if preload fails.
          }
        }
        setPhotoPreview(null);
        setUploadError(null);
        setGenerateError(null);
        // Generation runs in the background; the poll hook resolves it. Don't yank
        // the user to the detail view — if they stay on the generating screen the
        // effect below opens the result; if they leave, the gallery tile + a
        // notification surface it instead.
        awaitingUploadGenerationRef.current = true;
      } catch (error) {
        const message =
          error instanceof FutureYouGenerateError ? error.message
          : error instanceof FutureYouUploadError ? error.message
          : "Could not start generation. Try again.";
        if (/source photo not found/i.test(message)) {
          onFutureYouPatch({ photoStoragePath: undefined, photoUploaded: false });
          setUploadStep("photo");
        }
        setGenerateError(message);
      } finally {
        setGenerating(false);
      }
    },
    [onFutureYouPatch, photoPreview, profile, timeline],
  );

  const onReplaceDeleteOld = useCallback(async () => {
    if (replaceBusy || !replacePendingGenerate) return;
    const snapshot = futureYouUploadSnapshot(draft);
    const currentJobId = draft.generationJobId?.trim();
    const keptPreviews = draft.previews ?? [];
    setReplaceBusy(true);
    try {
      // Remove only the current preview's server data; keep older previews intact.
      await deleteFutureYou(currentJobId || undefined);
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
      const nextDraft = mergeFutureYouDraft(undefined, {
        ...snapshot,
        previews: keptPreviews.length > 0 ? keptPreviews : undefined,
      });
      setFitnessState((prev) => ({ ...prev, futureYou: nextDraft }));
      await executeGeneration(nextDraft);
    } catch {
      setGenerateError("Could not remove your current preview. Try again.");
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
    } finally {
      setReplaceBusy(false);
    }
  }, [
    draft,
    executeGeneration,
    replaceBusy,
    replacePendingGenerate,
    setFitnessState,
  ]);

  const onReplaceKeepOld = useCallback(() => {
    if (!replacePendingGenerate) return;
    setReplaceDialogOpen(false);
    setReplacePendingGenerate(false);

    // Preserve the current ready preview before the new job overwrites the active fields.
    const currentJobId = draft.generationJobId?.trim();
    let baseDraft = draft;
    if (currentJobId && draft.generationStatus === "ready") {
      const kept: FutureYouPreview = { jobId: currentJobId, timeline };
      if (draft.generationReadyAt) kept.readyAt = draft.generationReadyAt;
      if (draft.motivationId) kept.motivationId = draft.motivationId;
      if (draft.motivationIsGeneric) kept.motivationIsGeneric = true;
      if (draft.photoStoragePath?.trim()) kept.sourcePhotoPath = draft.photoStoragePath.trim();
      const existing = (draft.previews ?? []).filter((preview) => preview.jobId !== currentJobId);
      const nextPreviews = [kept, ...existing];
      baseDraft = mergeFutureYouDraft(draft, { previews: nextPreviews });
      setFitnessState((prev) => ({
        ...prev,
        futureYou: mergeFutureYouDraft(prev.futureYou, { previews: nextPreviews }),
      }));
    }

    void executeGeneration(baseDraft);
  }, [draft, executeGeneration, replacePendingGenerate, setFitnessState, timeline]);

  const onReplaceCancel = useCallback(() => {
    setReplaceDialogOpen(false);
    setReplacePendingGenerate(false);
  }, []);

  const promptReplaceDialog = useCallback(() => {
    setReplacePendingGenerate(true);
    setReplaceDialogOpen(true);
  }, []);

  const continueMotivation = useCallback(async () => {
    const motivationId = draft.motivationId?.trim();
    if (!motivationId || generating || replaceBusy) return;
    if (!draft.photoStoragePath && !photoPreview) return;

    if (shouldPromptReplace) {
      promptReplaceDialog();
      return;
    }

    await executeGeneration(draft);
  }, [
    draft,
    generating,
    photoPreview,
    replaceBusy,
    shouldPromptReplace,
    promptReplaceDialog,
    executeGeneration,
  ]);

  const onSelectMotivation = useCallback(
    (motivationId: string, isGeneric: boolean) => {
      setGenerateError(null);
      onFutureYouPatch({ motivationId, motivationIsGeneric: isGeneric });
    },
    [onFutureYouPatch],
  );

  useEffect(() => {
    if (view !== "upload" || generationStatus !== "ready" || !awaitingUploadGenerationRef.current) {
      return;
    }
    const jobId = draft.generationJobId?.trim();
    if (!jobId) return;

    awaitingUploadGenerationRef.current = false;
    setSelectedItemId(jobId);
    setView("detail");
    setPhotoPreview(null);
    setUploadError(null);
    setGenerateError(null);
    setUploadStep("photo");
  }, [view, generationStatus, draft.generationJobId]);

  useEffect(() => {
    if (generationStatus !== "failed") return;
    if (view !== "detail" && view !== "upload") return;
    // Motivation picker is shown before generate is tapped — don't surface a stale failed job.
    if (view === "upload" && uploadStep === "motivation" && !generating && !generationActive) return;
    setGenerateError((prev) => prev ?? "Generation failed. Try again.");
    if (view === "detail") {
      setView("upload");
      setUploadStep("motivation");
      setSelectedItemId(null);
    }
  }, [generationStatus, view, uploadStep, generating, generationActive]);

  // Notify when generation finishes while the user has left the generating screen.
  const prevGenerationStatusRef = useRef(generationStatus);
  useEffect(() => {
    const prev = prevGenerationStatusRef.current;
    prevGenerationStatusRef.current = generationStatus;
    if (prev === "ready" || generationStatus !== "ready") return;
    const jobId = draft.generationJobId?.trim();
    if (!jobId) return;
    // Still on the loader/preview — they'll see the result without interruption.
    if (view === "detail" || view === "upload") return;
    if (AppState.currentState === "active") {
      Alert.alert(FUTURE_YOU_READY_NOTIFICATION_TITLE, FUTURE_YOU_READY_NOTIFICATION_BODY, [
        { text: "Later", style: "cancel" },
        {
          text: "View",
          onPress: () => {
            setSelectedItemId(jobId);
            setView("detail");
          },
        },
      ]);
    } else {
      void presentFutureYouReadyNotification();
    }
  }, [generationStatus, view, draft.generationJobId]);

  const applyPhotoPreview = useCallback(
    (preview: string) => {
      setUploadError(null);
      setPhotoPreview(preview);
      const consentAt = draft.photoAiConsentAt ?? new Date().toISOString();
      onFutureYouPatch({
        photoSkipped: false,
        photoUploaded: false,
        photoStoragePath: undefined,
        photoAiConsentAt: consentAt,
      });
    },
    [draft.photoAiConsentAt, onFutureYouPatch],
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

  const continuePhotoUpload = useCallback(async () => {
    const preview = photoPreview;
    const consentAt = draft.photoAiConsentAt;
    if (photoBlocked || !preview || !consentAt) return;

    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadFutureYouPhoto(preview);
      setGenerateError(null);
      onFutureYouPatch({
        photoSkipped: false,
        photoUploaded: true,
        photoAiConsentAt: consentAt,
        photoStoragePath: result.path,
        ...(draft.generationStatus === "failed" ? { generationStatus: "idle" as const } : {}),
      });
      setPhotoPreview(null);
      setUploadStep("motivation");
    } catch (error) {
      const message =
        error instanceof FutureYouUploadError ?
          error.message
        : "Photo upload failed. Try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }, [draft.photoAiConsentAt, draft.generationStatus, onFutureYouPatch, photoBlocked, photoPreview]);

  const onGrantAiConsent = useCallback(() => {
    if (!draft.photoAiConsentAt) {
      onFutureYouPatch({ photoAiConsentAt: new Date().toISOString() });
    }
  }, [draft.photoAiConsentAt, onFutureYouPatch]);

  const onClearPhoto = useCallback(() => {
    setPhotoPreview(null);
    setUploadError(null);
    onFutureYouPatch({ photoUploaded: false, photoStoragePath: undefined });
  }, [onFutureYouPatch]);

  const onBackToPhoto = useCallback(() => {
    setGenerateError(null);
    setUploadStep("photo");
  }, []);

  const onTryNewYou = useCallback(() => {
    if (!canRedo) return;
    openUploadPage();
  }, [canRedo, openUploadPage]);

  const onOpenGalleryItem = useCallback((item: FutureYouGalleryItem) => {
    setSelectedItemId(item.id);
    setView("detail");
  }, []);

  const onBackToGallery = useCallback(() => {
    setView("gallery");
    setSelectedItemId(null);
  }, []);

  const showNewChip = Boolean(mode) && view === "gallery" && !photoBlocked;
  const showHeader = view === "gallery";

  const goal = profile?.goal ?? "cut";
  const effectiveGenerateError = generateError;

  function renderBody() {
    if (view === "upload") {
      return (
        <FutureYouNewPicView
          step={uploadStep}
          goal={goal}
          gender={gender}
          age={age}
          photoPreview={photoPreview}
          photoSaved={Boolean(draft.photoStoragePath && !photoPreview)}
          photoAiConsentAt={draft.photoAiConsentAt}
          motivationId={draft.motivationId}
          uploading={uploading}
          uploadError={uploadError}
          generating={generating || replaceBusy}
          generationActive={generationActive}
          generationStatus={generationStatus}
          generateError={effectiveGenerateError}
          onClose={closeUploadPage}
          onBackToPhoto={onBackToPhoto}
          onPickFromCamera={pickFromCamera}
          onPickFromGallery={pickFromGallery}
          onConfirmPhoto={continuePhotoUpload}
          onRetryUpload={continuePhotoUpload}
          onClearPhoto={onClearPhoto}
          onGrantAiConsent={onGrantAiConsent}
          onSelectMotivation={onSelectMotivation}
          onGenerate={continueMotivation}
        />
      );
    }

    if (view === "detail" && detailItem) {
      const detailIsActive = detailItem.id === draft.generationJobId?.trim();
      return (
        <FutureYouDetailView
          item={detailItem}
          goal={goal}
          gender={gender}
          motivationId={detailIsActive ? draft.motivationId : undefined}
          generationStatus={detailIsActive ? generationStatus : "ready"}
          futureYou={draft}
          jobId={detailItem.id}
          sourcePhotoPath={detailSourcePhotoPath}
          onBack={onBackToGallery}
          onFutureYouDeleted={onDetailFutureYouDeleted}
        />
      );
    }

    return (
      <View className="mt-[18px]">
        <FutureYouGalleryView
          items={galleryItems}
          gender={gender}
          pageLede={pageLede}
          pageRedoLede={pageRedoLede}
          showEmptyTryCta={!photoBlocked && canRedo}
          onOpenItem={onOpenGalleryItem}
          onTryNewYou={onTryNewYou}
        />
      </View>
    );
  }

  return (
    <View testID="tab-future-you" style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{
          paddingBottom,
          paddingTop,
          flexGrow: view === "detail" || view === "upload" ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
      >
        {showHeader ? (
          <ScreenHeader
            title="NewYou"
            titleTestID="future-you-title"
            right={
              showNewChip ? (
                <FutureYouNewChip canRedo={canRedo} onPress={onTryNewYou} />
              ) : undefined
            }
          />
        ) : null}
        {renderBody()}
      </ScrollView>
      <FutureYouReplaceDialog
        open={replaceDialogOpen}
        busy={replaceBusy}
        onCancel={onReplaceCancel}
        onDeleteOld={() => void onReplaceDeleteOld()}
        onKeepOld={onReplaceKeepOld}
      />
    </View>
  );
}
