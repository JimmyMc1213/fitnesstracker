import { Pressable, ScrollView, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { EXERCISE_EQUIPMENT_LABELS, type ExerciseEquipmentLabel } from "@/lib/workout/exerciseLabels";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  open?: boolean;
  selected?: string;
  onSelect: (label: ExerciseEquipmentLabel) => void;
  onClose: () => void;
};

export function ExerciseEquipmentLabelPickerDialog({
  open = true,
  selected,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <CenterDialog open={open} onClose={onClose} panelStyle={{ padding: 0, maxWidth: 340, width: "100%" }}>
      <View testID="exercise-equipment-label-picker" className="w-full overflow-hidden rounded-2xl">
        <View className="px-5 pb-2 pt-5">
          <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            Equipment type
          </Text>
          <Text className="mt-1 text-[13px] leading-5" style={{ color: colors.textSecondary }}>
            Choose how this exercise is performed.
          </Text>
        </View>

        <ScrollView className="max-h-[360px] px-3 pb-2" keyboardShouldPersistTaps="handled">
          {EXERCISE_EQUIPMENT_LABELS.map((label) => {
            const active = selected === label;
            return (
              <Pressable
                key={label}
                onPress={() => {
                  onSelect(label);
                  onClose();
                }}
                className="mb-1 flex-row items-center rounded-xl px-3 py-3"
                style={{
                  backgroundColor: active ? colors.backgroundSecondary : "transparent",
                  borderWidth: active ? 0.5 : 0,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="border-t" style={{ borderColor: colors.border }}>
          <Pressable onPress={onClose} className="items-center py-3.5">
            <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </CenterDialog>
  );
}
