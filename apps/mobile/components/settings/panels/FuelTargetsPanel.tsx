import {
  clampMacroInputString,
  clampMacroValue,
} from "@newyouai/core";
import type { MacroTotals } from "@newyouai/types";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  SettingsDetailCard,
  SettingsFieldLabel,
  SettingsHelper,
} from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";

function MacroField({
  label,
  fieldKey,
  raw,
  onRawChange,
  onCommit,
  testID,
}: {
  label: string;
  fieldKey: keyof MacroTotals;
  raw: string;
  onRawChange: (next: string) => void;
  onCommit: (patch: Partial<MacroTotals>) => void;
  testID: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1 }}>
      <SettingsFieldLabel>{label}</SettingsFieldLabel>
      <TextInput
        testID={testID}
        value={raw}
        onChangeText={(v) => {
          onRawChange(v);
          if (v === "" || v === "-") return;
          const n = parseFloat(v);
          if (Number.isFinite(n) && n >= 0) {
            onCommit({ [fieldKey]: clampMacroValue(fieldKey, n) } as Partial<MacroTotals>);
          }
        }}
        onBlur={() => {
          const clampedRaw = clampMacroInputString(raw, fieldKey);
          onRawChange(clampedRaw);
          const n = parseFloat(clampedRaw);
          const val = Number.isFinite(n) && n >= 0 ? clampMacroValue(fieldKey, n) : 0;
          onCommit({ [fieldKey]: val } as Partial<MacroTotals>);
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={label}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.textPrimary,
          fontSize: 15,
        }}
      />
    </View>
  );
}

export function FuelTargetsPanel() {
  const { state, setFitnessState } = useFitnessState();
  const T = state?.nutritionTargets;

  const [calIn, setCalIn] = useState("");
  const [pIn, setPIn] = useState("");
  const [cIn, setCIn] = useState("");
  const [fIn, setFIn] = useState("");

  useEffect(() => {
    if (!T) return;
    setCalIn(String(T.cal));
    setPIn(String(T.p));
    setCIn(String(T.c));
    setFIn(String(T.f));
  }, [T?.cal, T?.p, T?.c, T?.f]);

  if (!state || !T) return null;

  function commit(patch: Partial<MacroTotals>) {
    setFitnessState((prev) => ({
      ...prev,
      nutritionTargets: { ...prev.nutritionTargets, ...patch },
    }));
  }

  return (
    <>
      <SettingsHelper>
        Daily calorie and macro goals used on Home, Fuel, habits copy, and weekly review math.
      </SettingsHelper>
      <SettingsDetailCard>
        <MacroField
          label="Calories (cal)"
          fieldKey="cal"
          raw={calIn}
          onRawChange={setCalIn}
          onCommit={commit}
          testID="settings-fuel-cal"
        />
        <View className="flex-row" style={{ gap: 12 }}>
          <MacroField
            label="Protein (g)"
            fieldKey="p"
            raw={pIn}
            onRawChange={setPIn}
            onCommit={commit}
            testID="settings-fuel-p"
          />
          <MacroField
            label="Carbs (g)"
            fieldKey="c"
            raw={cIn}
            onRawChange={setCIn}
            onCommit={commit}
            testID="settings-fuel-c"
          />
          <MacroField
            label="Fat (g)"
            fieldKey="f"
            raw={fIn}
            onRawChange={setFIn}
            onCommit={commit}
            testID="settings-fuel-f"
          />
        </View>
      </SettingsDetailCard>
    </>
  );
}
