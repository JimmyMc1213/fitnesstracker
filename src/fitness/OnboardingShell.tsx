import type { ReactNode } from "react";

export const ONBOARDING_TOTAL_STEPS = 30;

export function phaseForStep(step: number): { phaseLabel?: string } {
  if (step <= 1) return {};
  if (step <= 7) return { phaseLabel: "About you" };
  if (step <= 11) return { phaseLabel: "Your goal" };
  if (step <= 21) return { phaseLabel: "Your training" };
  if (step <= 23) return { phaseLabel: "Your fuel" };
  if (step <= 28) return { phaseLabel: "Launch" };
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
  const { phaseLabel } = phaseForStep(step);
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div
      className="onboarding-shell"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
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
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label="Onboarding progress"
          >
            <div className="onboarding-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      {eyebrow ? <p className="onboarding-eyebrow">{eyebrow}</p> : null}
      {!hideHeader ? (
        <>
          <h1 className={headlineClassName ? `onboarding-headline ${headlineClassName}` : "onboarding-headline"}>{title}</h1>
          {subtitle ? (
            <p className={helperClassName ? `onboarding-helper ${helperClassName}` : "onboarding-helper"}>{subtitle}</p>
          ) : null}
        </>
      ) : null}

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
