import type { MacroTotals } from "@newyouai/types";
import { Text, View } from "react-native";

import { ProgressSectionLabel } from "@/components/progress/ProgressSectionLabel";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  targets: MacroTotals;
};

const TARGET_ROWS = [
  { label: "Calories", valueKey: "cal" as const, unit: "cal" },
  { label: "Protein", valueKey: "p" as const, unit: "g" },
  { label: "Carbs", valueKey: "c" as const, unit: "g" },
  { label: "Fat", valueKey: "f" as const, unit: "g" },
];

export function NutritionTargetsGrid({ targets }: Props) {
  const { colors } = useAppTheme();

  return (
    <>
      <ProgressSectionLabel>Targets</ProgressSectionLabel>
      <View
        testID="progress-targets-grid"
        className="rounded-[14px] border p-[18px]"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row flex-wrap gap-3">
          {TARGET_ROWS.map((row) => (
            <View key={row.label} className="w-[47%]">
              <Text
                className="text-[10px] font-medium uppercase tracking-widest"
                style={{ color: colors.textSecondary }}
              >
                {row.label}
              </Text>
              <View className="mt-1.5 flex-row items-baseline gap-1">
                <Text
                  className="text-[22px] font-bold tabular-nums"
                  style={{ color: colors.textPrimary }}
                >
                  {String(targets[row.valueKey])}
                </Text>
                <Text
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: colors.textTertiary }}
                >
                  {row.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text
          className="mt-3.5 text-[11px] leading-[16px]"
          style={{ color: colors.textTertiary }}
        >
          Steps: Settings
        </Text>
      </View>
    </>
  );
}
