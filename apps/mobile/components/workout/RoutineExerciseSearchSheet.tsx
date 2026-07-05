import { ExerciseSearchPicker } from "@/components/workout/ExerciseSearchPicker";
import type { CustomExerciseTemplate, EquipmentSetup } from "@newyouai/types";

type Props = {
  open?: boolean;
  title?: string;
  equipmentSetup: EquipmentSetup;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onSaveCustomAndAdd?: (name: string, label: string) => void;
  onClose: () => void;
  closeOnSelect?: boolean;
  confirmLabel?: string;
};

export function RoutineExerciseSearchSheet({
  open = true,
  title = "Choose exercise",
  equipmentSetup,
  customExercises,
  onSelect,
  onSaveCustomAndAdd: _onSaveCustomAndAdd,
  onClose,
  closeOnSelect = true,
  confirmLabel = "Add",
}: Props) {
  return (
    <ExerciseSearchPicker
      open={open}
      title={title}
      equipmentSetup={equipmentSetup}
      customExercises={customExercises}
      onSelect={onSelect}
      onClose={onClose}
      closeOnSelect={closeOnSelect}
      confirmLabel={confirmLabel}
      testID="routine-exercise-search-sheet"
    />
  );
}
