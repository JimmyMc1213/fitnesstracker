import {
  buildFutureYouGalleryItem,
  canRedoFutureYouTransformation,
  FUTURE_YOU_PAGE_BLOCKED_LEDE,
  futureYouDraftAfterUserDelete,
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
import type { FutureYouDraft } from "@newyouai/types";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { FutureYouDetailView } from "@/components/future-you/FutureYouDetailView";
import { FutureYouFullscreenViewer } from "@/components/future-you/FutureYouFullscreenViewer";
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
import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import {
  E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL,
  isE2eMockFutureYouEnabled,
} from "@/lib/e2e/futureYouMock";
import { compressImageToJpegDataUrl } from "@/lib/imageCompress";
import { ageFromDateOfBirth } from "@/lib/onboardingProfile";
import { FutureYouUploadError, uploadFutureYouPhoto } from "@/lib/futureYouUploadService";

type PageView = "gallery" | "detail" | "upload";

function permissionDeniedMessage(kind: "camera" | "gallery"): string {
  return kind === "camera" ?
      "Camera access is off. Enable it in Settings or choose from gallery."
    : "Photo library access is off. Enable it in Settings or use the camera.";
}

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
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenImageUri, setFullscreenImageUri] = useState<string | null>(null);

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
    pollEnabled:
      tabFocused &&
      (mode === "reveal" || view === "detail" || (view === "upload" && uploadJobActive)),
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

  const redoAnchorIso = futureYouRedoAnchorIso(draft);
  const msUntilRedo = useMemo(
    () => msUntilFutureYouRedoEligible(redoAnchorIso),
    [redoAnchorIso, redoCountdownTick],
  );
  const canRedo = canRedoFutureYouTransformation(mode, generationStatus, redoAnchorIso);
  const shouldPromptReplace = shouldPromptFutureYouReplaceDialog(
    mode,
    generationStatus,
    redoAnchorIso,
  );
  const pageLede = photoBlocked ? FUTURE_YOU_PAGE_BLOCKED_LEDE : futureYouPageLede(mode);
  const pageRedoLede = futureYouPageRedoLede(msUntilRedo);

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

  const galleryItems = useMemo((): FutureYouGalleryItem[] => {
    if (!shouldShowFutureYouGalleryTile(mode, generationStatus) || !galleryItem) return [];
    return [galleryItem];
  }, [mode, generationStatus, galleryItem]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return galleryItems[0] ?? null;
    return galleryItems.find((item) => item.id === selectedItemId) ?? galleryItems[0] ?? null;
  }, [galleryItems, selectedItemId]);

  const saveableImageUri = generationStatus === "ready" ? imageUri : null;

  const detailItem = useMemo((): FutureYouGalleryItem | null => {
    if (!selectedItem) return null;
    return {
      ...selectedItem,
      imageSrc: selectedItem.loading ? selectedItem.imageSrc : saveableImageUri ?? selectedItem.imageSrc,
      loading: revealLoading,
    };
  }, [selectedItem, saveableImageUri, revealLoading]);

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
    setView("upload");
  }, [photoBlocked]);

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

  const handleFutureYouDeleted = useCallback(() => {
    setFitnessState((prev) => {
      const next = futureYouDraftAfterUserDelete(prev.futureYou);
      return {
        ...prev,
        futureYou: Object.keys(next).length > 0 ? next : undefined,
      };
    });
  }, [setFitnessState]);

  const onDetailFutureYouDeleted = useCallback(() => {
    setView("gallery");
    setSelectedItemId(null);
    setFullscreenOpen(false);
    handleFutureYouDeleted();
  }, [handleFutureYouDeleted]);

  const executeGeneration = useCallback(
    async (fromDraft: FutureYouDraft) => {
      const motivationId = fromDraft.motivationId?.trim();
      const sourcePath = fromDraft.photoStoragePath;
      if (!motivationId || !sourcePath || !profile) return;

      setGenerateError(null);
      setGenerating(true);
      try {
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
        awaitingUploadGenerationRef.current = true;
        setUploadStep("motivation");
      } catch (error) {
        const message =
          error instanceof FutureYouGenerateError ?
            error.message
          : "Could not start generation. Try again.";
        setGenerateError(message);
      } finally {
        setGenerating(false);
      }
    },
    [onFutureYouPatch, profile, timeline],
  );

  const onReplaceDeleteOld = useCallback(async () => {
    if (replaceBusy || !replacePendingGenerate) return;
    const snapshot = futureYouUploadSnapshot(draft);
    setReplaceBusy(true);
    try {
      await deleteFutureYou();
      handleFutureYouDeleted();
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
      const nextDraft = mergeFutureYouDraft(undefined, snapshot);
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
    handleFutureYouDeleted,
    replaceBusy,
    replacePendingGenerate,
    setFitnessState,
  ]);

  const onReplaceKeepOld = useCallback(() => {
    if (!replacePendingGenerate) return;
    setReplaceDialogOpen(false);
    setReplacePendingGenerate(false);
    void executeGeneration(draft);
  }, [draft, executeGeneration, replacePendingGenerate]);

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
    if (!motivationId || !draft.photoStoragePath || generating || replaceBusy) return;

    if (shouldPromptReplace) {
      promptReplaceDialog();
      return;
    }

    await executeGeneration(draft);
  }, [
    draft,
    generating,
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

  const onPickImageUri = useCallback(
    async (uri: string) => {
      setUploadError(null);
      try {
        const preview = await compressImageToJpegDataUrl(uri);
        setPhotoPreview(preview);
        const consentAt = draft.photoAiConsentAt ?? new Date().toISOString();
        onFutureYouPatch({
          photoSkipped: false,
          photoUploaded: false,
          photoStoragePath: undefined,
          photoAiConsentAt: consentAt,
        });
      } catch {
        setUploadError("Could not read that photo. Try another image.");
      }
    },
    [draft.photoAiConsentAt, onFutureYouPatch],
  );

  const pickFromCamera = useCallback(async () => {
    if (isE2eMockFutureYouEnabled()) {
      setUploadError(null);
      const consentAt = draft.photoAiConsentAt ?? new Date().toISOString();
      setPhotoPreview(E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL);
      onFutureYouPatch({
        photoSkipped: false,
        photoUploaded: false,
        photoStoragePath: undefined,
        photoAiConsentAt: consentAt,
      });
      return;
    }
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
  }, [draft.photoAiConsentAt, onFutureYouPatch, onPickImageUri]);

  const pickFromGallery = useCallback(async () => {
    if (isE2eMockFutureYouEnabled()) {
      setUploadError(null);
      const consentAt = draft.photoAiConsentAt ?? new Date().toISOString();
      setPhotoPreview(E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL);
      onFutureYouPatch({
        photoSkipped: false,
        photoUploaded: false,
        photoStoragePath: undefined,
        photoAiConsentAt: consentAt,
      });
      return;
    }
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
  }, [draft.photoAiConsentAt, onFutureYouPatch, onPickImageUri]);

  const continuePhotoUpload = useCallback(async () => {
    const preview = photoPreview;
    const consentAt = draft.photoAiConsentAt;
    if (photoBlocked || !preview || !consentAt) return;

    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadFutureYouPhoto(preview);
      onFutureYouPatch({
        photoSkipped: false,
        photoUploaded: true,
        photoAiConsentAt: consentAt,
        photoStoragePath: result.path,
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
  }, [draft.photoAiConsentAt, onFutureYouPatch, photoBlocked, photoPreview]);

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
  const effectiveGenerateError =
    generateError ??
    (view === "upload" && uploadStep === "motivation" && generationStatus === "failed" ?
      "Generation failed. Try again."
    : null);

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
      return (
        <FutureYouDetailView
          item={detailItem}
          timeline={timeline}
          gender={gender}
          futureYou={draft}
          jobId={draft.generationJobId}
          onBack={onBackToGallery}
          onOpenFullscreen={() => {
            if (!saveableImageUri) return;
            setFullscreenImageUri(saveableImageUri);
            setFullscreenOpen(true);
          }}
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
    <View testID="tab-future-you" style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingBottom, paddingTop }}
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
      <FutureYouFullscreenViewer
        open={fullscreenOpen}
        imageUri={fullscreenImageUri}
        onClose={() => setFullscreenOpen(false)}
      />
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
