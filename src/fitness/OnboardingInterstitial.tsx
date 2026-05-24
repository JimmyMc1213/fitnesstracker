import type { ReactNode } from "react";

import { OnboardingShell } from "./OnboardingShell";

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
};

export function OnboardingInterstitial({
  step,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
}: Props) {
  return (
    <OnboardingShell step={step} title={title} subtitle={subtitle} onBack={onBack} onContinue={onContinue} continueLabel={continueLabel}>
      {children ?? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, opacity: 0.85 }}>
            {["🏋️", "🥗", "📈"].map((icon) => (
              <span key={icon} style={{ fontSize: 32 }} aria-hidden>
                {icon}
              </span>
            ))}
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}
