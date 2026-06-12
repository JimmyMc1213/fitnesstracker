import type { WeightUnit } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

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
    <View className="gap-2">
      <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
        Weight ({unit})
      </Text>
      <TextInput
        testID="onboarding-weight-input"
        value={text}
        onChangeText={(raw) => {
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
          commitText(raw);
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
        className="rounded-2xl border px-4 py-3.5 text-base"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.textPrimary,
        }}
        accessibilityLabel="Body weight"
      />
    </View>
  );
}
