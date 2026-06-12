import type { HeightDisplayUnit } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

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

  const inputStyle = {
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.textPrimary,
  };

  if (unit === "cm") {
    return (
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Height (cm)
        </Text>
        <TextInput
          value={cmText}
          onChangeText={(raw) => {
            if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
            setCmText(raw);
          }}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          className="rounded-2xl border px-4 py-3.5 text-base"
          style={inputStyle}
          accessibilityLabel="Height in centimeters"
        />
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      <View className="flex-1 gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          Ft
        </Text>
        <TextInput
          testID="onboarding-height-feet"
          value={feetText}
          onChangeText={(raw) => {
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setFeetText(raw);
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          className="rounded-2xl border px-4 py-3.5 text-base"
          style={inputStyle}
          accessibilityLabel="Height feet"
        />
      </View>
      <View className="flex-1 gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          In
        </Text>
        <TextInput
          testID="onboarding-height-inches"
          value={inchesText}
          onChangeText={(raw) => {
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setInchesText(raw);
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          className="rounded-2xl border px-4 py-3.5 text-base"
          style={inputStyle}
          accessibilityLabel="Height inches"
        />
      </View>
    </View>
  );
}
