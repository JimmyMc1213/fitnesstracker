import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
};

export function MacroBar({ label, value, target, unit = "g", color }: Props) {
  const { colors } = useAppTheme();
  const pct = Math.max(0, Math.min(1, target > 0 ? value / target : 0));
  const barColor = color ?? colors.textSecondary;

  return (
    <View className="min-w-0 flex-1 gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[11px]" style={{ color: barColor }}>
          {label}
        </Text>
        <Text className="text-xs font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
          {Math.round(value)}
          <Text style={{ color: colors.textTertiary, fontWeight: "400" }}>
            {" "}
            / {target}
            {unit}
          </Text>
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}
