import { useEffect, useRef, useState, type ReactNode } from "react";

import { isFutureYouPhotoBlocked } from "./futureYouAge";
import { FUTURE_YOU_PRIVACY_POLICY_URL } from "./futureYouLegal";
import { futureYouSilhouettesForGender } from "./futureYouSilhouettes";
import type { UserGender } from "./types";

type Props = {
  gender: UserGender | undefined;
  age: number | null;
  photoPreview: string | null;
  photoSaved: boolean;
  photoAiConsentAt: string | undefined;
  uploading: boolean;
  uploadError: string | null;
  onPickPhoto: (file: File) => void | Promise<void>;
  onConfirmPhoto: () => void | Promise<void>;
  onRetryUpload: () => void | Promise<void>;
  onClearPhoto: () => void;
  onGrantAiConsent: () => void;
};

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15V5M12 5l-3.5 3.5M12 5l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Panel({ children, variant = "before" }: { children: ReactNode; variant?: "before" | "after" }) {
  return (
    <div className="future-you-photo-step__panel-wrap">
      <div
        className={
          variant === "after" ?
            "future-you-photo-step__panel future-you-photo-step__panel--after"
          : "future-you-photo-step__panel"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function OnboardingFutureYouPhoto({
  gender,
  age,
  photoPreview,
  photoSaved,
  photoAiConsentAt,
  uploading,
  uploadError,
  onPickPhoto,
  onConfirmPhoto,
  onRetryUpload,
  onClearPhoto,
  onGrantAiConsent,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const suppressConfirmClickRef = useRef(false);
  const [aiConsentChecked, setAiConsentChecked] = useState(Boolean(photoAiConsentAt));
  const [confirmReady, setConfirmReady] = useState(false);
  const blocked = isFutureYouPhotoBlocked(age);
  const hasPhoto = Boolean(photoPreview || photoSaved);
  const silhouettes = futureYouSilhouettesForGender(gender);
  const canRetry = Boolean(uploadError && hasPhoto);
  const canUpload = aiConsentChecked && !uploading && !blocked;
  const awaitingConfirm = Boolean(photoPreview && !photoSaved && !canRetry);

  useEffect(() => {
    if (!awaitingConfirm) {
      setConfirmReady(false);
      return;
    }
    suppressConfirmClickRef.current = true;
    setConfirmReady(false);
    const id = window.setTimeout(() => {
      suppressConfirmClickRef.current = false;
      setConfirmReady(true);
    }, 400);
    return () => window.clearTimeout(id);
  }, [awaitingConfirm, photoPreview]);

  function openPicker() {
    if (!canUpload) return;
    fileRef.current?.click();
  }

  function onConfirmClick() {
    if (uploading || !canUpload || !confirmReady || suppressConfirmClickRef.current) return;
    void onConfirmPhoto();
  }

  return (
    <div className="future-you-photo-step">
      <div className="future-you-photo-step__hero-area">
        <div className="future-you-photo-step__hero">
          <div
            className={`future-you-photo-step__panels${blocked ? " future-you-photo-step__panels--blocked" : ""}`}
          >
            <div className="future-you-photo-step__before-col">
              <Panel>
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="future-you-photo-step__photo" />
                ) : silhouettes ? (
                  <img src={silhouettes.before} alt="" aria-hidden className="future-you-photo-step__silhouette" />
                ) : null}
              </Panel>
              <div className="future-you-photo-step__panel-foot">
                {hasPhoto && !uploading ? (
                  <button
                    type="button"
                    className="tap future-you-photo-step__remove"
                    disabled={!canUpload}
                    onClick={onClearPhoto}
                  >
                    Remove photo
                  </button>
                ) : (
                  <span className="future-you-photo-step__panel-foot-spacer" aria-hidden />
                )}
              </div>
            </div>

            <span className="future-you-photo-step__arrow" aria-hidden>
              →
            </span>

            <Panel variant="after">
              {silhouettes ? (
                <img src={silhouettes.after} alt="" aria-hidden className="future-you-photo-step__silhouette" />
              ) : null}
            </Panel>
          </div>

          {blocked ? (
            <div className="future-you-photo-step__blocked-overlay">
              <p>Future You is only for users 18+.</p>
            </div>
          ) : null}
        </div>
      </div>

      {!blocked ? (
        <div className="future-you-photo-step__actions">
        <p className="future-you-photo-step__trust">
          Your photo is only used to create your Future You. It is never sold, and never shared
          except with the AI provider that generates your image.
        </p>

        <label className="future-you-photo-step__consent">
          <input
            type="checkbox"
            className="future-you-photo-step__consent-input"
            checked={aiConsentChecked}
            disabled={uploading}
            onChange={(e) => {
              const checked = e.target.checked;
              setAiConsentChecked(checked);
              if (checked) onGrantAiConsent();
            }}
          />
          <span className="future-you-photo-step__consent-label">
            My photo will be processed by AI to generate my{" "}
            <span className="future-you-photo-step__consent-label-tail">
              transformation.{" "}
              <a
                href={FUTURE_YOU_PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="future-you-photo-step__consent-link"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </span>
          </span>
        </label>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file || !aiConsentChecked) return;
            suppressConfirmClickRef.current = true;
            void onPickPhoto(file);
          }}
        />

        <div className="future-you-photo-step__primary-slot">
          {canRetry ? (
            <button
              type="button"
              className="tap future-you-photo-step__upload future-you-photo-step__primary-action"
              disabled={!canUpload}
              onClick={() => void onRetryUpload()}
            >
              Try again
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`tap future-you-photo-step__upload future-you-photo-step__primary-action${
                  awaitingConfirm ? " future-you-photo-step__primary-action--hidden" : ""
                }`}
                disabled={!canUpload}
                tabIndex={awaitingConfirm ? -1 : 0}
                aria-hidden={awaitingConfirm}
                onClick={openPicker}
              >
                <UploadIcon />
                {uploading ? "Uploading…" : "Upload Your Photo"}
              </button>
              <button
                type="button"
                className={`tap onboarding-continue future-you-photo-step__confirm future-you-photo-step__primary-action${
                  awaitingConfirm ? "" : " future-you-photo-step__primary-action--hidden"
                }`}
                disabled={!canUpload || !confirmReady}
                tabIndex={awaitingConfirm ? 0 : -1}
                aria-hidden={!awaitingConfirm}
                onClick={onConfirmClick}
              >
                <span>Use this photo</span>
                <span aria-hidden>→</span>
              </button>
            </>
          )}
        </div>

        {uploadError ? (
          <p role="alert" className="future-you-photo-step__error">
            {uploadError}
          </p>
        ) : null}
        </div>
      ) : null}

      <p className="future-you-photo-step__legal">
        Illustrative preview — not medical advice. Delete anytime in Settings.
      </p>
    </div>
  );
}
