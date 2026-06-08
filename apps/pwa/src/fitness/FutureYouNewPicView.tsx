import { OnboardingFutureYouMotivation } from "./OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "./OnboardingFutureYouPhoto";
import {
  FUTURE_YOU_PAGE_GENERATE_LABEL,
  FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION,
  FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO,
} from "./futureYouPageModel";
import { FUTURE_YOU_DETAIL_BACK_LABEL } from "./futureYouGalleryModel";
import type { OnboardingProfile, UserGender } from "./types";

export type FutureYouNewPicStep = "photo" | "motivation";

type Props = {
  step: FutureYouNewPicStep;
  profile: OnboardingProfile;
  gender: UserGender | undefined;
  age: number | null;
  photoPreview: string | null;
  photoSaved: boolean;
  photoAiConsentAt: string | undefined;
  motivationId: string | undefined;
  uploading: boolean;
  uploadError: string | null;
  generating: boolean;
  generateError: string | null;
  onClose: () => void;
  onBackToPhoto: () => void;
  onPickPhoto: (file: File) => void | Promise<void>;
  onConfirmPhoto: () => void | Promise<void>;
  onRetryUpload: () => void | Promise<void>;
  onClearPhoto: () => void;
  onGrantAiConsent: () => void;
  onSelectMotivation: (motivationId: string, isGeneric: boolean) => void;
  onGenerate: () => void | Promise<void>;
};

export function FutureYouNewPicView({
  step,
  profile,
  gender,
  age,
  photoPreview,
  photoSaved,
  photoAiConsentAt,
  motivationId,
  uploading,
  uploadError,
  generating,
  generateError,
  onClose,
  onBackToPhoto,
  onPickPhoto,
  onConfirmPhoto,
  onRetryUpload,
  onClearPhoto,
  onGrantAiConsent,
  onSelectMotivation,
  onGenerate,
}: Props) {
  const title = step === "photo" ? FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO : FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION;

  return (
    <div className="future-you-new-pic-page">
      <header className="future-you-new-pic-sheet__header">
        {step === "motivation" ?
          <button type="button" className="tap future-you-new-pic-sheet__back" onClick={onBackToPhoto}>
            Back
          </button>
        : <button type="button" className="tap future-you-new-pic-sheet__back" onClick={onClose}>
            ← {FUTURE_YOU_DETAIL_BACK_LABEL}
          </button>
        }
        <h2 id="future-you-new-pic-title" className="future-you-new-pic-sheet__title">
          {title}
        </h2>
        <span className="future-you-new-pic-sheet__header-spacer" aria-hidden />
      </header>

      <div className="future-you-new-pic-sheet__body">
        {step === "photo" ?
          <OnboardingFutureYouPhoto
            gender={gender}
            age={age}
            photoPreview={photoPreview}
            photoSaved={photoSaved}
            photoAiConsentAt={photoAiConsentAt}
            uploading={uploading}
            uploadError={uploadError}
            onPickPhoto={onPickPhoto}
            onConfirmPhoto={onConfirmPhoto}
            onRetryUpload={onRetryUpload}
            onClearPhoto={onClearPhoto}
            onGrantAiConsent={onGrantAiConsent}
          />
        : <>
            <p className="future-you-new-pic-sheet__lede">Choose the transformation you&apos;re working toward.</p>
            <OnboardingFutureYouMotivation
              goal={profile.goal ?? "cut"}
              gender={gender ?? "other"}
              selectedId={motivationId}
              onSelect={onSelectMotivation}
            />
            {generateError ?
              <p role="alert" className="future-you-new-pic-sheet__error">
                {generateError}
              </p>
            : null}
            <button
              type="button"
              className="tap onboarding-paywall__cta onboarding-paywall__cta--gold future-you-new-pic-sheet__cta"
              disabled={!motivationId || generating}
              onClick={() => void onGenerate()}
            >
              {generating ? "Starting…" : FUTURE_YOU_PAGE_GENERATE_LABEL}
            </button>
          </>
        }
      </div>
    </div>
  );
}
