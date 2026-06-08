import { useState } from "react";

import { FutureYouDeleteButton } from "./FutureYouDeleteButton";
import { FutureYouReportButton } from "./FutureYouReportButton";
import { futureYouRedoAnchorIso } from "./futureYouPageModel";
import type { FutureYouDraft } from "./futureYouDraft";
import { FUTURE_YOU_SUCCESS_AI_LABEL } from "./futureYouSuccessModel";
import {
  FUTURE_YOU_DETAIL_BACK_LABEL,
  FUTURE_YOU_GALLERY_SAVE_LABEL,
  FUTURE_YOU_GALLERY_SAVE_SUCCESS,
  FUTURE_YOU_GALLERY_SAVING_LABEL,
  type FutureYouGalleryItem,
} from "./futureYouGalleryModel";
import { OnboardingFutureYouSuccessHero } from "./OnboardingFutureYouSuccessHero";
import { saveImageToDevice } from "./saveImageToDevice";

type Props = {
  item: FutureYouGalleryItem;
  timeline: string;
  jobId: string | undefined;
  futureYou: FutureYouDraft | undefined;
  previewMode?: boolean;
  onBack: () => void;
  onOpenFullscreen: () => void;
  onFutureYouDeleted: () => void;
};

export function FutureYouDetailView({
  item,
  timeline,
  jobId,
  futureYou,
  previewMode = false,
  onBack,
  onOpenFullscreen,
  onFutureYouDeleted,
}: Props) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const canSave = Boolean(item.imageSrc && !item.loading);
  const canFullscreen = Boolean(item.imageSrc && !item.loading);

  async function onSave() {
    if (!item.imageSrc) return;
    setSaveState("saving");
    setSaveError(null);
    const result = await saveImageToDevice(item.imageSrc, `newyou-${item.id.slice(0, 8)}.png`);
    if (result.ok) {
      setSaveState("success");
      return;
    }
    setSaveState("error");
    setSaveError(result.error);
  }

  return (
    <div className="future-you-detail">
      <div className="future-you-detail__toolbar">
        <button type="button" className="tap future-you-detail__back" onClick={onBack}>
          ← {FUTURE_YOU_DETAIL_BACK_LABEL}
        </button>
        <FutureYouDeleteButton
          previewMode={previewMode}
          className="future-you-detail__delete"
          redoAnchorIso={futureYouRedoAnchorIso(futureYou)}
          onDeleted={onFutureYouDeleted}
        />
      </div>

      <button
        type="button"
        className="tap future-you-detail__hero"
        disabled={!canFullscreen}
        aria-label={canFullscreen ? "View full screen" : undefined}
        onClick={() => {
          if (canFullscreen) onOpenFullscreen();
        }}
      >
        <OnboardingFutureYouSuccessHero
          timeline={timeline}
          imageSrc={item.imageSrc}
          loading={item.loading}
        />
      </button>

      <p className="future-you-page__ai-label future-you-page__ai-label--compact">
        {FUTURE_YOU_SUCCESS_AI_LABEL}
      </p>

      <div className="future-you-detail__actions">
        <button
          type="button"
          className="tap onboarding-continue future-you-detail__save"
          disabled={!canSave || saveState === "saving"}
          onClick={() => void onSave()}
        >
          {saveState === "saving" ? FUTURE_YOU_GALLERY_SAVING_LABEL : FUTURE_YOU_GALLERY_SAVE_LABEL}
        </button>

        {saveState === "success" ?
          <p className="future-you-detail__save-success" role="status">
            {FUTURE_YOU_GALLERY_SAVE_SUCCESS}
          </p>
        : null}
        {saveState === "error" && saveError ?
          <p className="future-you-detail__save-error" role="alert">
            {saveError}
          </p>
        : null}

        <FutureYouReportButton jobId={jobId} context="home" className="future-you-page__report" />
      </div>
    </div>
  );
}
