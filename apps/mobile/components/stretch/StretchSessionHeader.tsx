import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWorkoutDuration } from "@newyouai/core";

type Props = {
  elapsedSec: number;
  onFinish: () => void;
  onCancel: () => void;
  startedAt: string;
  moveCount: number;
};

export function StretchSessionHeader({ elapsedSec, onFinish, onCancel, startedAt, moveCount }: Props) {
  const { colors } = useAppTheme();
  const moveLabel = `${moveCount} move${moveCount === 1 ? "" : "s"}`;

  return (
    <View testID="stretch-session-header" className="pt-2">
      <View className="mb-1 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Text style={{ fontSize: 20, lineHeight: 1 }} accessibilityElementsHidden>
            ⏱
          </Text>
          <Text className="text-xl font-bold tabular-nums tracking-tight" style={{ color: colors.textPrimary }}>
            {formatWorkoutDuration(elapsedSec)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            testID="stretch-cancel"
            onPress={onCancel}
            accessibilityLabel="Cancel mobility session"
            className="h-10 w-10 items-center justify-center rounded-[10px] border"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
          </Pressable>
          <PrimaryButton testID="stretch-finish" onPress={onFinish} style={{ minHeight: 40, paddingVertical: 10, paddingHorizontal: 18 }}>
            Finish routine
          </PrimaryButton>
        </View>
      </View>

      <Text className="mb-1 text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
        Mobility routine
      </Text>
      <Text className="mb-2.5 text-xs font-medium" style={{ color: colors.textTertiary }}>
        Started {startedAt} · {moveLabel}
      </Text>
    </View>
  );
}
