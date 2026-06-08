import type { MouseEvent } from "react";

import { IconMoon, IconSun } from "./icons";
import { OnboardingShell } from "./OnboardingShell";
import type { AppTheme } from "./theme";

type Props = {
  step: number;
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function OnboardingThemePicker({ step, value, onChange, onBack, onContinue }: Props) {
  const isLight = value === "light";

  function selectTheme(next: AppTheme) {
    if (next !== value) onChange(next);
  }

  function handleSwitchClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const next: AppTheme = event.clientX - rect.left < rect.width / 2 ? "light" : "dark";
    selectTheme(next);
  }

  return (
    <OnboardingShell
      step={step}
      title="Choose your look"
      subtitle="You can change this anytime in Settings"
      onBack={onBack}
      onContinue={onContinue}
      hideProgress
      contentClassName="onboarding-shell__content--theme-switch"
    >
      <div className="onboarding-theme-switch-wrap">
        <button
          type="button"
          className={`tap onboarding-theme-switch${isLight ? "" : " onboarding-theme-switch--dark"}`}
          role="switch"
          aria-checked={isLight}
          aria-label={`Theme: ${isLight ? "Light" : "Dark"}`}
          onClick={handleSwitchClick}
        >
          <span className="onboarding-theme-switch__thumb" aria-hidden />
          <span
            className={`onboarding-theme-switch__option onboarding-theme-switch__option--light${isLight ? " onboarding-theme-switch__option--active" : ""}`}
          >
            <IconSun size={22} stroke={1.6} />
            <span>Light</span>
          </span>
          <span
            className={`onboarding-theme-switch__option onboarding-theme-switch__option--dark${!isLight ? " onboarding-theme-switch__option--active" : ""}`}
          >
            <IconMoon size={22} stroke={1.6} />
            <span>Dark</span>
          </span>
        </button>
        <p className="onboarding-theme-switch__hint">{isLight ? "Clean and bright" : "Easy on the eyes"}</p>
      </div>
    </OnboardingShell>
  );
}
