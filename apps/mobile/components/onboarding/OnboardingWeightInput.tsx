import type { WeightUnit } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";

import {
  acceptsOnboardingWeightText,
  OnboardingFieldGroup,
  OnboardingInputField,
} from "@/components/onboarding/OnboardingInputField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LBS_PER_KG, lbsFromWeightInputText } from "@/lib/unitConversions";

function formatDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

function textFromWeightLbs(weightLbs: number, unit: WeightUnit): string {
  if (weightLbs <= 0) return "";
  const display = unit === "kg" ? weightLbs / LBS_PER_KG : weightLbs;
  return formatDecimal(display);
}

export function OnboardingWeightInput({
  unit,
  weightLbs,
  onWeightChange,
  resetKey,
}: {
  unit: WeightUnit;
  weightLbs: number;
  onWeightChange: (weightLbs: number) => void;
  resetKey?: string | number;
}) {
  const { colors } = useAppTheme();
  const [text, setText] = useState(() => textFromWeightLbs(weightLbs, unit));
  const onWeightChangeRef = useRef(onWeightChange);
  onWeightChangeRef.current = onWeightChange;

  useEffect(() => {
    setText(textFromWeightLbs(weightLbs, unit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function commitText(raw: string) {
    setText(raw);
    onWeightChangeRef.current(lbsFromWeightInputText(raw, unit));
  }

  return (
    <OnboardingFieldGroup label={`Weight (${unit})`} labelColor={colors.textTertiary}>
      <OnboardingInputField
        testID="onboarding-weight-input"
        shellStyle={{
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
        inputStyle={{ color: colors.textPrimary }}
        value={text}
        onChangeText={(raw) => {
          if (!acceptsOnboardingWeightText(raw)) return;
          commitText(raw);
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel="Body weight"
      />
    </OnboardingFieldGroup>
  );
}
