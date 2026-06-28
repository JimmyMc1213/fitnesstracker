import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FutureYouDraft, FutureYouPreview } from "./futureYouDraft";
import { futureYouUploadSnapshot, mergeFutureYouDraft } from "./futureYouDraft";
import { useFutureYouGalleryImages } from "./useFutureYouGalleryImages";
import { isFutureYouPhotoBlocked } from "./futureYouAge";
import {
  buildFutureYouGenerateProfile,
  FutureYouGenerateError,
  startFutureYouGeneration,
} from "./futureYouGenerateService";
import { deleteFutureYou } from "./futureYouDeleteService";
import { FutureYouDetailView } from "./FutureYouDetailView";
import { FutureYouFullscreenViewer } from "./FutureYouFullscreenViewer";
import {
  buildFutureYouGalleryItem,
  shouldShowFutureYouGalleryTile,
  type FutureYouGalleryItem,
} from "./futureYouGalleryModel";
import { FutureYouGalleryView } from "./FutureYouGalleryView";
import { FutureYouNewChip } from "./FutureYouNewChip";
import { ScreenHeader } from "./shared";
import { FutureYouNewPicView, type FutureYouNewPicStep } from "./FutureYouNewPicView";
import { FutureYouReplaceDialog } from "./FutureYouReplaceDialog";
import { getHomeFutureYouEntryMode, homeFutureYouMotivationLabel } from "./homeFutureYouModel";
import {
  canRedoFutureYouTransformation,
  futureYouPageLede,
  futureYouPageRedoLede,
  futureYouRedoAnchorIso,
  msUntilFutureYouRedoEligible,
  shouldPromptFutureYouReplaceDialog,
  shouldSkipFutureYouRedoCooldown,
} from "./futureYouPageModel";
import { futureYouRevealPlaceholderImage } from "./futureYouRevealPlaceholder";
import { futureYouTimelineFromProfile } from "./futureYouTimeline";
import { FutureYouPollError, pollFutureYouJobStatus } from "./futureYouPollService";
import { FutureYouUploadError, uploadFutureYouPhoto } from "./futureYouUploadService";
import { compressImageToJpegDataUrl } from "./imageCompress";
import { useFutureYouGenerationPoll } from "./useFutureYouGenerationPoll";
import { useFutureYouRevealImage } from "./useFutureYouRevealImage";
import type { OnboardingProfile, SubscriptionTier, UserGender } from "./types";

type PageView = "gallery" | "detail" | "upload";

type Props = {
  active: boolean;
  futureYou: FutureYouDraft | undefined;
  profile: OnboardingProfile;
  age: number | null;
  gender: UserGender | undefined;
  subscriptionTier: SubscriptionTier | null;
  onboardingComplete: boolean;
  onFutureYouChange: (patch: Partial<FutureYouDraft>) => void;
  onFutureYouDeleted: (jobId?: string) => void;
  previewMode?: boolean;
  futureYouUploadRequest?: number;
  onFutureYouUploadRequestHandled?: () => void;
};

export function FutureYouPageContent({
  active,
  futureYou,
  profile,
  age,
  gender,
  subscriptionTier,
  onboardingComplete,
  onFutureYouChange,
  onFutureYouDeleted,
  previewMode = false,
  futureYouUploadRequest,
  onFutureYouUploadRequestHandled,
}: Props) {
  const [view, setView] = useState<PageView>("gallery");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [replaceBusy, setReplaceBusy] = useState(false);
  const [replacePendingGenerate, setReplacePendingGenerate] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<FutureYouNewPicStep>("photo");

  const photoBlocked = isFutureYouPhotoBlocked(age);
  const draft = futureYou ?? {};
  const mode = getHomeFutureYouEntryMode(draft, photoBlocked, subscriptionTier, onboardingComplete);
  const timeline = futureYouTimelineFromProfile(profile);
  const motivationLabel = homeFutureYouMotivationLabel(draft.motivationId);

  const generationStatus = useFutureYouGenerationPoll({
    futureYou: draft,
    pollEnabled: active && (mode === "reveal" || view === "detail"),
    previewMode: false,
    onFutureYouPatch: onFutureYouChange,
  });

  const { imageSrc, loading } = useFutureYouRevealImage({
    jobId: draft.generationJobId,
    gender,
    status: generationStatus,
    subscriptionTier,
    previewMode: false,
  });
  const silhouetteSrc = futureYouRevealPlaceholderImage(gender);
  const revealImageSrc = imageSrc ?? silhouetteSrc;
  const revealLoading =
    loading || generationStatus === "queued" || generationStatus === "generating";

  const redoAnchorIso = futureYouRedoAnchorIso(draft);
  const [redoCountdownTick, setRedoCountdownTick] = useState(0);
  const msUntilRedo = useMemo(
    () => msUntilFutureYouRedoEligible(redoAnchorIso),
    [redoAnchorIso, redoCountdownTick],
  );
  const skipRedoCooldown = shouldSkipFutureYouRedoCooldown(draft);
  const onFutureYouReported = useCallback(
    (jobId: string) => {
      onFutureYouChange({ reportedJobId: jobId });
    },
    [onFutureYouChange],
  );

  const canRedo = canRedoFutureYouTransformation(
    mode,
    generationStatus,
    redoAnchorIso,
    previewMode,
    Date.now(),
    skipRedoCooldown,
  );
  const shouldPromptReplace = shouldPromptFutureYouReplaceDialog(
    mode,
    generationStatus,
    redoAnchorIso,
    previewMode,
    Date.now(),
    skipRedoCooldown,
  );
  const pageLede = futureYouPageLede(mode);
  const pageRedoLede = futureYouPageRedoLede(msUntilRedo, skipRedoCooldown);

  useEffect(() => {
    if (!active || msUntilRedo <= 0) return;
    const intervalMs = msUntilRedo < 48 * 60 * 60 * 1000 ? 60_000 : 60 * 60_000;
    const id = window.setInterval(() => setRedoCountdownTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [active, msUntilRedo]);

  const galleryItem = useMemo(
    () =>
      buildFutureYouGalleryItem({
        jobId: draft.generationJobId,
        imageSrc: revealImageSrc,
        timeline,
        motivationLabel,
        readyAtIso: draft.generationReadyAt,
        loading: revealLoading,
      }),
    [
      draft.generationJobId,
      draft.generationReadyAt,
      revealImageSrc,
      timeline,
      motivationLabel,
      revealLoading,
      generationStatus,
    ],
  );

  const previewImages = useFutureYouGalleryImages(draft.previews, subscriptionTier, previewMode);

  const previewItems = useMemo((): FutureYouGalleryItem[] => {
    const previews = draft.previews ?? [];
    return previews
      .map((preview) => {
        const resolved = previewImages[preview.jobId];
        return buildFutureYouGalleryItem({
          jobId: preview.jobId,
          imageSrc: resolved?.src ?? silhouetteSrc,
          timeline: preview.timeline ?? timeline,
          motivationLabel: homeFutureYouMotivationLabel(preview.motivationId),
          readyAtIso: preview.readyAt,
          loading: resolved?.loading ?? true,
        });
      })
      .filter((item): item is FutureYouGalleryItem => item !== null);
  }, [draft.previews, previewImages, silhouetteSrc, timeline]);

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

  const saveableImageSrc = generationStatus === "ready" ? imageSrc : null;

  const detailItem = useMemo((): FutureYouGalleryItem | null => {
    if (!selectedItem) return null;
    const isActiveJob = selectedItem.id === draft.generationJobId?.trim();
    if (isActiveJob) {
      return {
        ...selectedItem,
        imageSrc:
          selectedItem.loading ? selectedItem.imageSrc : saveableImageSrc ?? selectedItem.imageSrc,
        loading: revealLoading,
      };
    }
    const resolved = previewImages[selectedItem.id];
    return {
      ...selectedItem,
      imageSrc: resolved?.src ?? selectedItem.imageSrc,
      loading: resolved?.loading ?? false,
    };
  }, [selectedItem, saveableImageSrc, revealLoading, draft.generationJobId, previewImages]);

  const resetUploadFlow = useCallback(() => {
    setPhotoPreview(null);
    setUploadError(null);
    setGenerateError(null);
    setUploadStep("photo");
  }, []);

  useEffect(() => {
    if (!active) {
      setView("gallery");
      setSelectedItemId(null);
      setFullscreenOpen(false);
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
      setPhotoPreview(null);
      setUploadError(null);
      setGenerateError(null);
      setUploadStep("photo");
    }
  }, [active]);

  useEffect(() => {
    if (view === "detail" && galleryItems.length === 0) {
      setView("gallery");
      setSelectedItemId(null);
    }
  }, [view, galleryItems.length]);

  useEffect(() => {
    const jobId = draft.generationJobId?.trim();
    if (!active || previewMode || generationStatus !== "ready" || !jobId || draft.generationReadyAt) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await pollFutureYouJobStatus(jobId);
        if (cancelled || response.status !== "ready") return;
        onFutureYouChange({ generationReadyAt: response.updatedAt });
      } catch (error) {
        if (cancelled || !(error instanceof FutureYouPollError)) return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    active,
    previewMode,
    generationStatus,
    draft.generationJobId,
    draft.generationReadyAt,
    onFutureYouChange,
  ]);

  const openUploadPage = useCallback(() => {
    if (photoBlocked) return;
    resetUploadFlow();
    setView("upload");
  }, [photoBlocked, resetUploadFlow]);

  const handledUploadRequestRef = useRef(0);
  useEffect(() => {
    if (!active || !futureYouUploadRequest || futureYouUploadRequest <= handledUploadRequestRef.current) {
      return;
    }
    handledUploadRequestRef.current = futureYouUploadRequest;
    onFutureYouUploadRequestHandled?.();
    if (mode === "upload_prompt" && !photoBlocked) {
      openUploadPage();
    }
  }, [
    active,
    futureYouUploadRequest,
    mode,
    photoBlocked,
    onFutureYouUploadRequestHandled,
    openUploadPage,
  ]);

  function closeUploadPage() {
    setView("gallery");
    resetUploadFlow();
  }

  const onNewNewYouClick = useCallback(() => {
    if (!canRedo) return;
    openUploadPage();
  }, [canRedo, openUploadPage]);

  function onOpenGalleryItem(item: FutureYouGalleryItem) {
    setSelectedItemId(item.id);
    setView("detail");
  }

  function onBackToGallery() {
    setView("gallery");
    setFullscreenOpen(false);
  }

  function handleFutureYouDeleted(jobId?: string) {
    setView("gallery");
    setSelectedItemId(null);
    setFullscreenOpen(false);
    onFutureYouDeleted(jobId);
  }

  async function executeGeneration(fromDraft: FutureYouDraft) {
    const motivationId = fromDraft.motivationId?.trim();
    const sourcePath = fromDraft.photoStoragePath;
    if (!motivationId || !sourcePath) return;

    setGenerateError(null);
    setGenerating(true);
    try {
      const generateProfile = buildFutureYouGenerateProfile({
        goal: profile.goal ?? "maintain",
        gender: profile.gender ?? "other",
        weightLbs: profile.weightLbs,
        goalWeightLbs: profile.goalWeightLbs,
      });
      const result = await startFutureYouGeneration({
        sourcePath,
        motivationId,
        profile: generateProfile,
        timeline,
      });
      onFutureYouChange(
        mergeFutureYouDraft(fromDraft, {
          motivationId,
          motivationIsGeneric: fromDraft.motivationIsGeneric,
          generationJobId: result.jobId,
          generationStatus: result.status,
          photoSkipped: false,
        }),
      );
      resetUploadFlow();
      setView("gallery");
      setSelectedItemId(result.jobId);
    } catch (error) {
      const message =
        error instanceof FutureYouGenerateError ? error.message : "Could not start generation. Try again.";
      setGenerateError(message);
    } finally {
      setGenerating(false);
    }
  }

  async function onReplaceDeleteOld() {
    if (!replacePendingGenerate) return;
    const snapshot = futureYouUploadSnapshot(draft);
    const currentJobId = draft.generationJobId?.trim();
    const keptPreviews = draft.previews ?? [];
    setReplaceBusy(true);
    try {
      // Remove only the current preview's server data; keep older previews intact.
      await deleteFutureYou({ previewMode, jobId: currentJobId || undefined });
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
      const nextDraft = mergeFutureYouDraft(undefined, {
        ...snapshot,
        previews: keptPreviews.length > 0 ? keptPreviews : undefined,
      });
      onFutureYouChange(nextDraft);
      await executeGeneration(nextDraft);
    } catch {
      setReplaceDialogOpen(false);
      setReplacePendingGenerate(false);
    } finally {
      setReplaceBusy(false);
    }
  }

  function onReplaceKeepOld() {
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
      const existing = (draft.previews ?? []).filter((preview) => preview.jobId !== currentJobId);
      const nextPreviews = [kept, ...existing];
      baseDraft = mergeFutureYouDraft(draft, { previews: nextPreviews });
      onFutureYouChange({ previews: nextPreviews });
    }

    void executeGeneration(baseDraft);
  }

  function onReplaceCancel() {
    setReplaceDialogOpen(false);
    setReplacePendingGenerate(false);
  }

  async function onPickPhoto(file: File) {
    setUploadError(null);
    try {
      const dataUrl = await compressImageToJpegDataUrl(file);
      setPhotoPreview(dataUrl);
    } catch {
      setUploadError("Could not read that photo. Try another image.");
    }
  }

  async function continuePhotoUpload() {
    const preview = photoPreview;
    const consentAt = draft.photoAiConsentAt;
    if (photoBlocked || !preview || !consentAt) return;
    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadFutureYouPhoto(preview);
      onFutureYouChange(
        mergeFutureYouDraft(draft, {
          photoSkipped: false,
          photoUploaded: true,
          photoAiConsentAt: consentAt,
          photoStoragePath: result.path,
        }),
      );
      setPhotoPreview(null);
      setUploadStep("motivation");
    } catch (error) {
      const message =
        error instanceof FutureYouUploadError ? error.message : "Upload failed. Please try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  async function continueMotivation() {
    const motivationId = draft.motivationId?.trim();
    if (!motivationId || !draft.photoStoragePath || generating || replaceBusy) return;

    if (shouldPromptReplace) {
      setReplacePendingGenerate(true);
      setReplaceDialogOpen(true);
      return;
    }

    await executeGeneration(draft);
  }

  const body = useMemo(() => {
    if (!mode) {
      return (
        <div className="future-you-page__empty card">
          <p className="future-you-page__empty-text">
            {!onboardingComplete ?
              "Finish onboarding and start your plan to unlock NewYou."
            : "Subscribe to unlock your AI NewYou preview."}
          </p>
        </div>
      );
    }

    if (view === "detail" && detailItem) {
      return (
        <FutureYouDetailView
          item={detailItem}
          timeline={timeline}
          jobId={detailItem.id}
          futureYou={draft}
          previewMode={previewMode}
          onBack={onBackToGallery}
          onOpenFullscreen={() => setFullscreenOpen(true)}
          onFutureYouDeleted={() => handleFutureYouDeleted(detailItem.id)}
          onReported={onFutureYouReported}
        />
      );
    }

    if (view === "upload") {
      return (
        <FutureYouNewPicView
          step={uploadStep}
          profile={profile}
          gender={gender}
          age={age}
          photoPreview={photoPreview}
          photoSaved={Boolean(draft.photoStoragePath && !photoPreview)}
          photoAiConsentAt={draft.photoAiConsentAt}
          motivationId={draft.motivationId}
          uploading={uploading}
          uploadError={uploadError}
          generating={generating}
          generateError={generateError}
          onClose={closeUploadPage}
          onBackToPhoto={() => {
            setGenerateError(null);
            setUploadStep("photo");
          }}
          onPickPhoto={(file) => void onPickPhoto(file)}
          onConfirmPhoto={() => void continuePhotoUpload()}
          onRetryUpload={() => void continuePhotoUpload()}
          onClearPhoto={() => {
            setPhotoPreview(null);
            setUploadError(null);
          }}
          onGrantAiConsent={() => {
            if (!draft.photoAiConsentAt) {
              onFutureYouChange({ photoAiConsentAt: new Date().toISOString() });
            }
          }}
          onSelectMotivation={(motivationId, isGeneric) => {
            setGenerateError(null);
            onFutureYouChange({ motivationId, motivationIsGeneric: isGeneric });
          }}
          onGenerate={() => void continueMotivation()}
        />
      );
    }

    return (
      <FutureYouGalleryView
        items={galleryItems}
        gender={gender}
        pageLede={pageLede}
        pageRedoLede={pageRedoLede}
        showEmptyTryCta={!photoBlocked && canRedo}
        onOpenItem={onOpenGalleryItem}
        onTryNewYou={onNewNewYouClick}
      />
    );
  }, [
    mode,
    onboardingComplete,
    view,
    detailItem,
    galleryItems,
    gender,
    pageLede,
    pageRedoLede,
    profile,
    age,
    photoPreview,
    draft.photoStoragePath,
    draft.photoAiConsentAt,
    draft.motivationId,
    uploadStep,
    uploading,
    uploadError,
    generating,
    generateError,
    photoBlocked,
    canRedo,
    timeline,
    motivationLabel,
    draft.generationJobId,
    previewMode,
  ]);

  const fullscreenSrc = saveableImageSrc;
  const showHeader = view === "gallery";
  const showNewChip = Boolean(mode) && view === "gallery" && !photoBlocked;
  const detailFitLayout = view === "detail";

  return (
    <div
      className={`future-you-page__content${detailFitLayout ? " future-you-page__content--detail" : ""}`}
    >
      {showHeader ?
        <div className="future-you-screen-header">
          <ScreenHeader title="NewYou" titleAlign="center" />
          {showNewChip ? <FutureYouNewChip canRedo={canRedo} onClick={onNewNewYouClick} /> : null}
        </div>
      : null}
      {body}
      <FutureYouFullscreenViewer
        open={fullscreenOpen}
        imageSrc={fullscreenSrc}
        onClose={() => setFullscreenOpen(false)}
      />
      <FutureYouReplaceDialog
        open={replaceDialogOpen}
        busy={replaceBusy}
        onCancel={onReplaceCancel}
        onDeleteOld={() => void onReplaceDeleteOld()}
        onKeepOld={onReplaceKeepOld}
      />
    </div>
  );
}
