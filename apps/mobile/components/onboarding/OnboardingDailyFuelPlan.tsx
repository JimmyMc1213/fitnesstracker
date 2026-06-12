import type { MacroTotals } from "@newyouai/types";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { clampMacroValue } from "@/lib/macroLimits";

type MacroKey = "cal" | "p" | "c" | "f";

const MACRO_ROWS: {
  key: MacroKey;
  label: string;
  unit: string;
  tag: string;
}[] = [
  { key: "p", label: "Protein", unit: "g", tag: "#1 priority" },
  { key: "c", label: "Carbs", unit: "g", tag: "Your fuel" },
  { key: "f", label: "Fats", unit: "g", tag: "Hormone balance" },
];

function MacroValueField({
  macroKey,
  label,
  value,
  unit,
  onChange,
  large = false,
}: {
  macroKey: MacroKey;
  label: string;
  value: number;
  unit: string;
  onChange: (next: number) => void;
  large?: boolean;
}) {
  const { colors } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function commitDraft() {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 0) onChange(clampMacroValue(macroKey, n));
    else setDraft(String(value));
    setEditing(false);
  }

  if (editing) {
    return (
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={commitDraft}
        keyboardType="number-pad"
        autoFocus
        className={large ? "text-4xl font-bold" : "text-lg font-semibold"}
        style={{ color: colors.textPrimary, minWidth: 80 }}
      />
    );
  }

  return (
    <Pressable onPress={() => setEditing(true)} accessibilityLabel={`Edit ${label}`}>
      <Text
        className={large ? "text-4xl font-bold" : "text-lg font-semibold"}
        style={{ color: colors.textPrimary }}
      >
        {value}
        {unit ? (
          <Text className={large ? "text-xl" : "text-sm"} style={{ color: colors.textSecondary }}>
            {" "}
            {unit}
          </Text>
        ) : null}
      </Text>
    </Pressable>
  );
}

type Props = {
  macros: MacroTotals;
  computedMacros: MacroTotals;
  onChangeMacros: (next: MacroTotals) => void;
  onReset: () => void;
};

export function OnboardingDailyFuelPlan({ macros, computedMacros, onChangeMacros, onReset }: Props) {
  const { colors } = useAppTheme();
  const macrosEdited =
    macros.cal !== computedMacros.cal ||
    macros.p !== computedMacros.p ||
    macros.c !== computedMacros.c ||
    macros.f !== computedMacros.f;

  return (
    <View className="gap-4">
      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="mb-2 text-sm" style={{ color: colors.textSecondary }}>
          Daily calories
        </Text>
        <MacroValueField
          macroKey="cal"
          label="Calories"
          value={macros.cal}
          unit="cal"
          large
          onChange={(cal) => onChangeMacros({ ...macros, cal })}
        />
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="mb-3 text-sm font-semibold" style={{ color: colors.textSecondary }}>
          Macro split
        </Text>
        {MACRO_ROWS.map((row) => (
          <View key={row.key} className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>
                {row.label}
              </Text>
              <Text className="text-xs" style={{ color: colors.accent }}>
                {row.tag}
              </Text>
            </View>
            <MacroValueField
              macroKey={row.key}
              label={row.label}
              value={macros[row.key]}
              unit={row.unit}
              onChange={(next) => onChangeMacros({ ...macros, [row.key]: next })}
            />
          </View>
        ))}
      </View>

      {macrosEdited ? (
        <Pressable onPress={onReset}>
          <Text className="text-center text-sm font-medium" style={{ color: colors.accent }}>
            Reset to calculated values
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
