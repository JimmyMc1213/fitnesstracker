import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  doneMoves: number;
  totalMoves: number;
};

export function StretchSessionStickyHeader({ doneMoves, totalMoves }: Props) {
  const { colors } = useAppTheme();
  const pct = totalMoves > 0 ? Math.round((doneMoves / totalMoves) * 100) : 0;

  return (
    <View
      className="mt-3 flex-row items-center gap-[18px] rounded-xl border px-4 py-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Session
        </Text>
        <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textTertiary }}>
          {doneMoves}/{totalMoves} moves complete
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xl font-bold tabular-nums tracking-tight" style={{ color: colors.textPrimary }}>
          {pct}%
        </Text>
        <Text className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Progress
        </Text>
      </View>
    </View>
  );
}
