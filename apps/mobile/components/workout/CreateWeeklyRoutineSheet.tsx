import { Modal, Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";

type CreateWeeklyRoutineSheetProps = {
  open?: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onManual: () => void;
};

function OptionCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[14px] border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <Text className="text-base font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text className="mt-1.5 text-[13px] leading-[1.45] font-medium" style={{ color: colors.textSecondary }}>
        {description}
      </Text>
    </Pressable>
  );
}

export function CreateWeeklyRoutineSheet({
  open = true,
  onClose,
  onGenerate,
  onManual,
}: CreateWeeklyRoutineSheetProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onPress={onClose}
      >
        <Pressable
          testID="create-weekly-routine-sheet"
          className="w-full max-w-[440px] rounded-2xl p-5"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            New weekly routine
          </Text>
          <Text className="mt-2 text-sm leading-[1.5] font-medium" style={{ color: colors.textSecondary }}>
            Set up a full week of workouts. This replaces your current program.
          </Text>
          <View className="mt-4 gap-2.5">
            <OptionCard
              title="Generate for me"
              description="Answer a few training questions and Gymmy will build your split, exercises, and schedule."
              onPress={onGenerate}
            />
            <OptionCard
              title="Build it myself"
              description="Pick your training days and add exercises to each workout on your own."
              onPress={onManual}
            />
          </View>
          <View className="mt-4">
            <PrimaryButton block onPress={onClose}>
              Cancel
            </PrimaryButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
