import { Text } from "react-native";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

export function DeleteExerciseConfirmSheet({
  open = true,
  exerciseName,
  exerciseLabel,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  exerciseName: string;
  exerciseLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useAppTheme();
  const displayName = exerciseName.trim() || "this exercise";

  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="delete-exercise-sheet"
      title="Delete exercise?"
      message={
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          Remove{" "}
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{displayName}</Text>
          {exerciseLabel?.trim() ? (
            <Text style={{ color: colors.textTertiary }}> ({exerciseLabel.trim()})</Text>
          ) : null}{" "}
          from this workout? This can't be undone.
        </Text>
      }
      cancelLabel="Keep exercise"
      confirmLabel="Delete exercise"
      confirmDestructive
      cancelTestID="delete-exercise-cancel"
      confirmTestID="delete-exercise-confirm"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
