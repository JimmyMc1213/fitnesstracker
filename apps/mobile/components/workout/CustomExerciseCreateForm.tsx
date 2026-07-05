import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { AppTextField } from "@/components/ui/AppTextField";
import { PressableScale } from "@/components/ui/PressableScale";
import { EXERCISE_EQUIPMENT_LABELS, type ExerciseEquipmentLabel } from "@/lib/workout/exerciseLabels";
import { COACH_BLUE, WORKOUT_ACCENT_ON } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  name: string;
  selectedLabel: ExerciseEquipmentLabel | null;
  saveButtonLabel: string;
  onNameChange: (name: string) => void;
  onLabelChange: (label: ExerciseEquipmentLabel) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CustomExerciseCreateForm({
  name,
  selectedLabel,
  saveButtonLabel,
  onNameChange,
  onLabelChange,
  onSave,
  onCancel,
}: Props) {
  const { colors } = useAppTheme();
  const canSave = name.trim().length > 0 && selectedLabel !== null;

  return (
    <View className="gap-2">
      <AppTextField
        value={name}
        onChangeText={onNameChange}
        placeholder="Exercise name"
        autoFocus
      />

      <View>
        <Text className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
          Equipment type
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {EXERCISE_EQUIPMENT_LABELS.map((label) => {
            const selected = selectedLabel === label;
            return (
              <Pressable
                key={label}
                onPress={() => onLabelChange(label)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="rounded-lg px-2.5 py-1.5"
                style={{
                  backgroundColor: selected ? COACH_BLUE : "transparent",
                  borderWidth: selected ? 0 : 0.5,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: selected ? WORKOUT_ACCENT_ON : colors.textSecondary }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PressableScale
        onPress={onSave}
        disabled={!canSave}
        style={{
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          width: "100%",
          backgroundColor: canSave ? COACH_BLUE : colors.border,
          opacity: canSave ? 1 : 0.7,
        }}
      >
        <Text className="text-sm font-semibold" style={{ color: WORKOUT_ACCENT_ON }}>
          {saveButtonLabel}
        </Text>
      </PressableScale>

      <Pressable onPress={onCancel} className="items-center py-1.5">
        <Text className="text-xs font-medium" style={{ color: colors.textTertiary }}>
          Cancel
        </Text>
      </Pressable>
    </View>
  );
}
