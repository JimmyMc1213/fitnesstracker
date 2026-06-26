import type { HeightDisplayUnit } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import {
  OnboardingFieldGroup,
  OnboardingInputField,
  onboardingInputStyles,
} from "@/components/onboarding/OnboardingInputField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { cmFromInches, inchesFromCm } from "@/lib/unitConversions";

function textsFromHeightIn(heightIn: number): { feet: string; inches: string; cm: string } {
  if (heightIn <= 0) return { feet: "", inches: "", cm: "" };
  return {
    feet: String(Math.floor(heightIn / 12)),
    inches: String(Math.round(heightIn % 12)),
    cm: String(Math.round(cmFromInches(heightIn))),
  };
}

export function OnboardingHeightInput({
  unit,
  heightIn,
  onHeightChange,
  resetKey,
}: {
  unit: HeightDisplayUnit;
  heightIn: number;
  onHeightChange: (heightIn: number) => void;
  resetKey?: string | number;
}) {
  const { colors } = useAppTheme();
  const initial = textsFromHeightIn(heightIn);
  const [feetText, setFeetText] = useState(initial.feet);
  const [inchesText, setInchesText] = useState(initial.inches);
  const [cmText, setCmText] = useState(initial.cm);
  const onHeightChangeRef = useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;

  useEffect(() => {
    const next = textsFromHeightIn(heightIn);
    setFeetText(next.feet);
    setInchesText(next.inches);
    setCmText(next.cm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (unit === "cm") {
      if (cmText === "" || cmText === ".") {
        onHeightChangeRef.current(0);
        return;
      }
      const inches = inchesFromCm(parseFloat(cmText));
      onHeightChangeRef.current(inches ?? 0);
      return;
    }

    if (feetText === "" || inchesText === "") {
      onHeightChangeRef.current(0);
      return;
    }

    const ft = parseInt(feetText, 10);
    const inch = parseInt(inchesText, 10);
    if (!Number.isFinite(ft) || !Number.isFinite(inch)) {
      onHeightChangeRef.current(0);
      return;
    }
    onHeightChangeRef.current(ft * 12 + inch);
  }, [unit, feetText, inchesText, cmText]);

  const shellStyle = {
    borderColor: colors.border,
    backgroundColor: colors.card,
  };
  const inputStyle = { color: colors.textPrimary };

  if (unit === "cm") {
    return (
      <OnboardingFieldGroup label="Height (cm)" labelColor={colors.textTertiary}>
        <OnboardingInputField
          shellStyle={shellStyle}
          inputStyle={inputStyle}
          value={cmText}
          onChangeText={(raw) => {
            if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
            setCmText(raw);
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Height in centimeters"
        />
      </OnboardingFieldGroup>
    );
  }

  return (
    <View style={onboardingInputStyles.row}>
      <OnboardingFieldGroup fill label="Ft" labelColor={colors.textTertiary}>
        <OnboardingInputField
          testID="onboarding-height-feet"
          shellStyle={shellStyle}
          inputStyle={inputStyle}
          value={feetText}
          onChangeText={(raw) => {
            if (raw !== "" && (!/^\d+$/.test(raw) || raw.length > 1)) return;
            setFeetText(raw);
          }}
          keyboardType="number-pad"
          maxLength={1}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Height feet"
        />
      </OnboardingFieldGroup>
      <OnboardingFieldGroup fill label="In" labelColor={colors.textTertiary}>
        <OnboardingInputField
          testID="onboarding-height-inches"
          shellStyle={shellStyle}
          inputStyle={inputStyle}
          value={inchesText}
          onChangeText={(raw) => {
            if (raw !== "" && (!/^\d+$/.test(raw) || raw.length > 2)) return;
            setInchesText(raw);
          }}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Height inches"
        />
      </OnboardingFieldGroup>
    </View>
  );
}
