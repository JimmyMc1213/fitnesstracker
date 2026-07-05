import { Text } from "react-native";

import { ExerciseSearchPicker } from "@/components/workout/ExerciseSearchPicker";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CustomExerciseTemplate, EquipmentSetup } from "@newyouai/types";

type Props = {
  open?: boolean;
  equipmentSetup: EquipmentSetup;
  currentName: string;
  currentLabel?: string;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onClose: () => void;
};

export function ExerciseSwapSheet({
  open = true,
  equipmentSetup,
  currentName,
  currentLabel,
  customExercises,
  onSelect,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <ExerciseSearchPicker
      open={open}
      title="Swap exercise"
      subtitle={
        <>
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            {currentName}
            {currentLabel ? ` · ${currentLabel}` : ""}
          </Text>
          <Text className="mt-2 text-xs leading-[1.45]" style={{ color: colors.textTertiary }}>
            Sets, targets, and logged reps stay on this row. Your saved workout is not changed.
          </Text>
        </>
      }
      equipmentSetup={equipmentSetup}
      customExercises={customExercises}
      onSelect={onSelect}
      onClose={onClose}
      confirmLabel="Swap"
      testID="exercise-swap-sheet"
    />
  );
}
