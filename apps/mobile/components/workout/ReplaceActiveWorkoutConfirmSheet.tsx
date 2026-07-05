import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";

import { CenterDialog } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";

export function ReplaceActiveWorkoutConfirmSheet({
  open = true,
  pendingWorkoutTitle,
  currentWorkoutTitle,
  onResume,
  onDiscardAndStart,
  onCancel,
}: {
  open?: boolean;
  pendingWorkoutTitle: string;
  currentWorkoutTitle: string;
  onResume: () => void;
  onDiscardAndStart: () => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  const currentTitle = currentWorkoutTitle.trim() || "Workout";

  return (
    <CenterDialog open={open} onClose={onCancel} panelStyle={{ padding: 0, maxWidth: 384 }}>
      <View testID="replace-active-workout-sheet" className="w-full overflow-hidden rounded-2xl">
        <View className="px-7 py-7">
          <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            Workout in progress
          </Text>
          <Text className="mt-3 text-sm leading-5" style={{ color: colors.textSecondary }}>
            You have{" "}
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{currentTitle}</Text> in progress. Resume
            it or discard it before starting{" "}
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{pendingWorkoutTitle}</Text>.
          </Text>
        </View>
        <View className="border-t" style={{ borderColor: colors.border }}>
          <Pressable
            testID="replace-active-workout-resume"
            onPress={onResume}
            className="items-center border-b py-3.5"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
              Resume workout
            </Text>
          </Pressable>
          <Pressable
            testID="replace-active-workout-discard"
            onPress={onDiscardAndStart}
            className="items-center border-b py-3.5"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-[15px] font-semibold" style={{ color: "#FF453A" }}>
              Discard & start new
            </Text>
          </Pressable>
          <Pressable testID="replace-active-workout-cancel" onPress={onCancel} className="items-center py-3.5">
            <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </CenterDialog>
  );
}
