import type { ReactNode } from "react";

export const ONBOARDING_TOTAL_STEPS = 23;

export function phaseForStep(step: number): { phaseLabel?: string; showStepCounter: boolean } {
  if (step <= 0) return { showStepCounter: false };
  if (step === 1) return { showStepCounter: false };
  if (step <= 7) return { phaseLabel: "About you", showStepCounter: true };
  if (step <= 11) return { phaseLabel: "Your goal", showStepCounter: true };
  if (step <= 16) return { phaseLabel: "Your training", showStepCounter: true };
  if (step <= 18) return { phaseLabel: "Your fuel", showStepCounter: true };
  if (step <= 21) return { phaseLabel: "Launch", showStepCounter: true };
  return { phaseLabel: "Launch", showStepCounter: false };
}

export function OnboardingShell({
  step,
  totalSteps = ONBOARDING_TOTAL_STEPS,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  onSecondary,
  continueLabel = "Continue",
  secondaryLabel = "Edit",
  continueDisabled = false,
  hideProgress = false,
  hideFooter = false,
}: {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  onSecondary?: () => void;
  continueLabel?: string;
  secondaryLabel?: string;
  continueDisabled?: boolean;
  hideProgress?: boolean;
  hideFooter?: boolean;
}) {
  const { phaseLabel, showStepCounter } = phaseForStep(step);
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px 28px",
        background: "var(--bg)",
        boxSizing: "border-box",
      }}
    >
      {!hideProgress ? (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 8,
            }}
          >
            {showStepCounter ? (
              <span>
                Step {step + 1} of {totalSteps}
              </span>
            ) : (
              <span />
            )}
            {phaseLabel ? <span>{phaseLabel}</span> : <span />}
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "#fff",
                borderRadius: 2,
                transition: "width 0.2s",
              }}
            />
          </div>
        </div>
      ) : null}
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 8px" }}>{title}</h1>
      {subtitle ? (
        <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>{subtitle}</p>
      ) : null}
      <div key={step} className="motion-step" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {children}
      </div>
      {!hideFooter ? (
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {onBack ? (
          <button
            type="button"
            className="tap"
            onClick={onBack}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "#fff",
            }}
          >
            Back
          </button>
        ) : null}
        {onSecondary ? (
          <button
            type="button"
            className="tap"
            onClick={onSecondary}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "#fff",
            }}
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          className="tap"
          disabled={continueDisabled}
          onClick={onContinue}
          style={{
            flex: onBack || onSecondary ? 2 : 1,
            padding: 14,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            background: continueDisabled ? "rgba(255,255,255,0.25)" : "#fff",
            color: continueDisabled ? "rgba(0,0,0,0.4)" : "#000",
          }}
        >
          {continueLabel}
        </button>
      </div>
      ) : null}
    </div>
  );
}
