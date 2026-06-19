import type { MacroTotals } from "@newyouai/types";
import { Text, View } from "react-native";

import { EditableNumber } from "@/components/onboarding/EditableNumber";
import { GradientCard } from "@/components/ui/GradientCard";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { clampMacroValue } from "@/lib/macroLimits";

type MacroKey = "cal" | "p" | "c" | "f";
type TagTone = "protein" | "carbs" | "fat";

const MACRO_TAG_COLORS: Record<TagTone, string> = {
  protein: "#c9a876",
  carbs: "#e85d5d",
  fat: "#6db88a",
};

const MACRO_ROWS: {
  key: MacroKey;
  label: string;
  unit: string;
  tag: string;
  tagTone: TagTone;
  priority?: boolean;
}[] = [
  { key: "p", label: "Protein", unit: "g", tag: "#1 priority", tagTone: "protein", priority: true },
  { key: "c", label: "Carbs", unit: "g", tag: "Your fuel", tagTone: "carbs" },
  { key: "f", label: "Fats", unit: "g", tag: "Hormone balance", tagTone: "fat" },
];

type Props = {
  macros: MacroTotals;
  computedMacros: MacroTotals;
  onChangeMacros: (next: MacroTotals) => void;
  onReset: () => void;
};

export function OnboardingDailyFuelPlan({ macros, computedMacros, onChangeMacros, onReset }: Props) {
  const { colors, ob } = useOnboardingTheme();
  const macrosEdited =
    macros.cal !== computedMacros.cal ||
    macros.p !== computedMacros.p ||
    macros.c !== computedMacros.c ||
    macros.f !== computedMacros.f;

  return (
    <View className="gap-4">
      <GradientCard>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
          Daily calories
        </Text>
        <EditableNumber
          variant="hero"
          label="Calories"
          value={macros.cal}
          unit="cal"
          sanitize={(n) => clampMacroValue("cal", n)}
          onChange={(cal) => onChangeMacros({ ...macros, cal })}
        />
      </GradientCard>

      <GradientCard>
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
          Macro split
        </Text>
        {MACRO_ROWS.map((row) => (
          <View
            key={row.key}
            className="mb-3 flex-row items-center justify-between"
            style={{ borderLeftWidth: 2, borderLeftColor: MACRO_TAG_COLORS[row.tagTone], paddingLeft: 10 }}
          >
            <View>
              <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>
                {row.label}
              </Text>
              <Text
                className="font-semibold uppercase"
                style={{
                  color: MACRO_TAG_COLORS[row.tagTone],
                  fontSize: row.tagTone === "protein" ? 11 : 10,
                  letterSpacing: 0.04 * (row.tagTone === "protein" ? 11 : 10),
                }}
              >
                {row.tag}
              </Text>
            </View>
            <EditableNumber
              variant="row"
              label={row.label}
              value={macros[row.key]}
              unit={row.unit}
              sanitize={(n) => clampMacroValue(row.key, n)}
              onChange={(next) => onChangeMacros({ ...macros, [row.key]: next })}
            />
          </View>
        ))}
      </GradientCard>

      {macrosEdited ? (
        <PressableScale onPress={onReset}>
          <Text className="text-center text-sm font-medium" style={{ color: ob.ghostFg }}>
            Reset to calculated values
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
