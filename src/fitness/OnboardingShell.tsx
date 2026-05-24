import { useCallback, useRef, type FocusEvent, type ReactNode } from "react";

import { isOnboardingTextField, scrollOnboardingFieldIntoView } from "./onboardingKeyboardScroll";

export const ONBOARDING_TOTAL_STEPS = 30;

export function phaseForStep(step: number): { phaseLabel?: string; showStepCounter: boolean } {
  if (step <= 1) return { showStepCounter: false };
  if (step <= 7) return { phaseLabel: "About you", showStepCounter: true };
  if (step <= 11) return { phaseLabel: "Your goal", showStepCounter: true };
  if (step <= 21) return { phaseLabel: "Your training", showStepCounter: true };
  if (step <= 23) return { phaseLabel: "Your fuel", showStepCounter: true };
  if (step <= 28) return { phaseLabel: "Launch", showStepCounter: true };
  return { showStepCounter: false };
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
  compactFooter = false,
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
  /** Tighter spacing between content and footer actions. */
  compactFooter?: boolean;
}) {
  const { phaseLabel, showStepCounter } = phaseForStep(step);
  const pct = Math.round(((step + 1) / totalSteps) * 100);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleBodyFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!isOnboardingTextField(event.target)) return;
    const body = bodyRef.current;
    if (!body) return;
    window.requestAnimationFrame(() => {
      scrollOnboardingFieldIntoView(body, event.target);
    });
  }, []);

  const bodyClassName = [
    "onboarding-shell__body",
    "motion-step",
    contentClassName,
    hideHeader ? "onboarding-shell__body--no-headline-gap" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="onboarding-shell">
      <div className="onboarding-shell__header">
        {onBack ? (
          <button type="button" className="onboarding-back-btn tap" onClick={onBack} aria-label="Back">
            <BackArrow />
          </button>
        ) : null}

        {!hideProgress ? (
          <div className="onboarding-shell__progress">
            <div className="onboarding-step-meta">
              {showStepCounter ? (
                <span>
                  Step {step + 1} of {totalSteps}
                </span>
              ) : (
                <span />
              )}
              {phaseLabel ? <span>{phaseLabel}</span> : <span />}
            </div>
            <div
              className="onboarding-progress-track"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-label={`Step ${step + 1} of ${totalSteps}`}
            >
              <div className="onboarding-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : null}

        {eyebrow ? <p className="onboarding-eyebrow">{eyebrow}</p> : null}
        {!hideHeader ? (
          <>
            <h1 className={headlineClassName ? `onboarding-headline ${headlineClassName}` : "onboarding-headline"}>
              {title}
            </h1>
            {subtitle ? (
              <p className={helperClassName ? `onboarding-helper ${helperClassName}` : "onboarding-helper"}>
                {subtitle}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <div
        key={step}
        ref={bodyRef}
        className={bodyClassName}
        onFocusCapture={handleBodyFocus}
      >
        {children}
      </div>

      {!compactFooter ? <div className="onboarding-shell__footer-spacer" aria-hidden /> : null}

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
