import { heightUnitLabel, volumeUnitLabel, weightUnitLabel } from "./unitPreferences";
import { OnboardingPillRow, OnboardingSegment } from "./OnboardingSegment";
import type { HeightDisplayUnit, UnitPreferences, VolumeUnit, WeightUnit } from "./types";

export function UnitPreferencePicker({
  value,
  onChange,
}: {
  value: UnitPreferences;
  onChange: (next: UnitPreferences) => void;
}) {
  const setWeight = (weightUnit: WeightUnit) => onChange({ ...value, weightUnit });
  const setHeight = (heightUnit: HeightDisplayUnit) => onChange({ ...value, heightUnit });
  const setVolume = (volumeUnit: VolumeUnit) => onChange({ ...value, volumeUnit });

  return (
    <div className="onboarding-field-stack">
      <div className="onboarding-field-group">
        <span className="onboarding-field-label">Weight</span>
        <OnboardingPillRow>
          {(["lbs", "kg"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.weightUnit === u} onClick={() => setWeight(u)}>
              {weightUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </div>
      <div className="onboarding-field-group">
        <span className="onboarding-field-label">Height</span>
        <OnboardingPillRow>
          {(["ft_in", "cm"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.heightUnit === u} onClick={() => setHeight(u)}>
              {heightUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </div>
      <div className="onboarding-field-group">
        <span className="onboarding-field-label">Volume</span>
        <OnboardingPillRow>
          {(["oz", "L"] as const).map((u) => (
            <OnboardingSegment key={u} layout="inline" selected={value.volumeUnit === u} onClick={() => setVolume(u)}>
              {volumeUnitLabel(u)}
            </OnboardingSegment>
          ))}
        </OnboardingPillRow>
      </div>
    </div>
  );
}
