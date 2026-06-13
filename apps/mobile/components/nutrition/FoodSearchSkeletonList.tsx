import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  rows?: number;
  showSectionHeader?: boolean;
};

function FoodSearchRowSkeleton({ isLast }: { isLast: boolean }) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-row items-center gap-3 py-3"
      style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}
    >
      <View className="min-w-0 flex-1 gap-2">
        <View className="h-[15px] w-[68%] rounded-md" style={{ backgroundColor: colors.border }} />
        <View className="h-3 w-[42%] rounded" style={{ backgroundColor: colors.border }} />
      </View>
      <View className="h-[18px] w-2.5 rounded" style={{ backgroundColor: colors.border }} />
    </View>
  );
}

export function FoodSearchSkeletonList({ rows = 4, showSectionHeader = true }: Props) {
  const { colors } = useAppTheme();

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Searching foods" accessibilityState={{ busy: true }}>
      {showSectionHeader ? (
        <View className="mb-2.5 h-[11px] w-[88px] rounded" style={{ backgroundColor: colors.border }} />
      ) : null}
      <View
        className="overflow-hidden rounded-[14px] border px-3.5 py-1"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {Array.from({ length: rows }, (_, idx) => (
          <FoodSearchRowSkeleton key={idx} isLast={idx === rows - 1} />
        ))}
      </View>
    </View>
  );
}
