import type { ReactNode } from "react";

import {
  ONBOARDING_STEP_ACTIVITY,
  ONBOARDING_STEP_FUTURE_YOU_MOTIVATION,
  ONBOARDING_STEP_FUTURE_YOU_PHOTO,
  ONBOARDING_STEP_RESIDENCY,
  ONBOARDING_STEP_FUTURE_YOU_SUCCESS,
  ONBOARDING_TOTAL_STEPS,
  onboardingProgressStep,
} from "./onboardingSteps";
import { FutureYouGenerationPillSlot } from "./FutureYouGenerationPillContext";
import { KEYBOARD_OPEN_THRESHOLD, useKeyboardViewport } from "./motion";

export { ONBOARDING_TOTAL_STEPS };

export function phaseForStep(step: number): { phaseLabel?: string } {
  if (step <= 1) return {};
  if (step <= 7) return { phaseLabel: "About you" };
  if (
    step <= ONBOARDING_STEP_ACTIVITY ||
    step === ONBOARDING_STEP_RESIDENCY ||
    step === ONBOARDING_STEP_FUTURE_YOU_PHOTO ||
    step === ONBOARDING_STEP_FUTURE_YOU_MOTIVATION
  ) {
    return { phaseLabel: "Your goal" };
  }
  if (step <= 21) return { phaseLabel: "Your training" };
  if (step <= 23) return { phaseLabel: "Your fuel" };
  if (step <= ONBOARDING_STEP_FUTURE_YOU_SUCCESS) return { phaseLabel: "Launch" };
  return {};
}

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OnboardingShell({
  step,
  totalSteps = ONBOARDING_TOTAL_STEPS,
  title,
  subtitle,
  eyebrow,
  children,
  onBack,
  onContinue,
  onSecondary,
  continueLabel = "Continue",
  secondaryLabel = "Edit",
  continueDisabled = false,
  hideProgress = false,
  hideFooter = false,
  hideHeader = false,
  contentClassName,
  headlineClassName,
  helperClassName,
  continueTone = "light",
  continueClassName,
  footerGhostAction,
  footerCaption,
  compactFooter = false,
  hideContinue = false,
  shellClassName,
  afterHeadline,
  hideGenerationPill = false,
}: {
  step: number;
  totalSteps?: number;
  title: ReactNode;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  onSecondary?: () => void;
  continueLabel?: string;
  secondaryLabel?: string;
  continueDisabled?: boolean;
  hideProgress?: boolean;
  hideFooter?: boolean;
  hideHeader?: boolean;
  contentClassName?: string;
  headlineClassName?: string;
  helperClassName?: string;
  /** Primary button style: light (default), dark outline, or blue accent. */
  continueTone?: "light" | "dark" | "blue" | "gold";
  continueClassName?: string;
  footerGhostAction?: { label: string; onClick: () => void };
  /** Small centered line under the primary footer action. */
  footerCaption?: string;
  /** Tighter spacing between content and footer actions. */
  compactFooter?: boolean;
  /** Hide the primary continue button while keeping the footer shell (e.g. ghost skip). */
  hideContinue?: boolean;
  /** Extra class on the outer onboarding shell root. */
  shellClassName?: string;
  /** Optional content rendered below the headline/subtitle and above main content. */
  afterHeadline?: ReactNode;
  /** Hide the Future You generation pill on this screen (e.g. plan ready uses its own banner). */
  hideGenerationPill?: boolean;
}) {
  const { phaseLabel } = phaseForStep(step);
  const progressStep = onboardingProgressStep(step);
  const pct = Math.round(((progressStep + 1) / totalSteps) * 100);
  const showGenerationPill =
    !hideGenerationPill && step >= ONBOARDING_STEP_ACTIVITY && step <= ONBOARDING_STEP_FUTURE_YOU_SUCCESS;
  const { keyboardBottom } = useKeyboardViewport();
  const keyboardOpen = keyboardBottom >= KEYBOARD_OPEN_THRESHOLD;
  const shellPaddingBottom = keyboardOpen
    ? `calc(max(1.25rem, env(safe-area-inset-bottom)) + ${keyboardBottom}px)`
    : "max(1.25rem, env(safe-area-inset-bottom))";

  return (
    <div
      className={shellClassName ? `onboarding-shell ${shellClassName}` : "onboarding-shell"}
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: shellPaddingBottom,
        paddingLeft: 23,
        paddingRight: 23,
      }}
    >
      {onBack ? (
        <button type="button" className="onboarding-back-btn tap" onClick={onBack} aria-label="Back">
          <BackArrow />
        </button>
      ) : null}

      {!hideProgress ? (
        <div style={{ marginBottom: 20 }}>
          {phaseLabel ? (
            <div className="onboarding-step-meta">
              <span>{phaseLabel}</span>
            </div>
          ) : null}
          <div
            className="onboarding-progress-track"
            role="progressbar"
            aria-valuenow={progressStep + 1}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label="Onboarding progress"
          >
            <div className="onboarding-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      {showGenerationPill ? <FutureYouGenerationPillSlot /> : null}

      {eyebrow ? <p className="onboarding-eyebrow">{eyebrow}</p> : null}
      {!hideHeader ? (
        <>
          <h1 className={headlineClassName ? `onboarding-headline ${headlineClassName}` : "onboarding-headline"}>{title}</h1>
          {subtitle ? (
            <p className={helperClassName ? `onboarding-helper ${helperClassName}` : "onboarding-helper"}>{subtitle}</p>
          ) : null}
        </>
      ) : null}

      {afterHeadline}

      <div
        className={
          contentClassName ? `onboarding-shell__content ${contentClassName}` : "onboarding-shell__content"
        }
        style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: hideHeader ? 0 : 24 }}
      >
        {children}
      </div>

      {!compactFooter ? <div style={{ minHeight: 16, flexShrink: 0 }} aria-hidden /> : null}

      {!hideFooter ? (
        <div
          className={compactFooter ? "onboarding-shell__footer onboarding-shell__footer--compact" : "onboarding-shell__footer"}
        >
          {onSecondary ? (
            <button
              type="button"
              className="tap onboarding-pill"
              onClick={onSecondary}
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              {secondaryLabel}
            </button>
          ) : null}
          {!hideContinue ? (
            <button
              type="button"
              className={`tap onboarding-continue${
                continueTone === "dark"
                  ? " onboarding-continue--dark"
                  : continueTone === "blue"
                    ? " onboarding-continue--blue"
                    : continueTone === "gold"
                      ? " onboarding-continue--gold"
                      : ""
              }${continueClassName ? ` ${continueClassName}` : ""}`}
              disabled={continueDisabled}
              onClick={onContinue}
            >
              {continueLabel}
            </button>
          ) : null}
          {footerCaption ? <p className="onboarding-footer-caption">{footerCaption}</p> : null}
          {footerGhostAction ? (
            <button type="button" className="tap onboarding-footer-ghost" onClick={footerGhostAction.onClick}>
              {footerGhostAction.label}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
