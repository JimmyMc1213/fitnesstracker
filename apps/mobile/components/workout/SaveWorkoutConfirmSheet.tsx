import { Text } from "react-native";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

export function SaveWorkoutConfirmSheet({
  open = true,
  title = "Save changes?",
  workoutName,
  message,
  cancelLabel = "Keep editing",
  confirmLabel = "Save workout",
  onSave,
  onCancel,
}: {
  open?: boolean;
  title?: string;
  workoutName: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="save-workout-confirm-sheet"
      title={title}
      message={
        message ?? (
          <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
            Your updates to{" "}
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{workoutName}</Text> will replace the saved
            workout.
          </Text>
        )
      }
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      confirmPrimary
      cancelTestID="save-workout-cancel"
      confirmTestID="save-workout-confirm"
      onCancel={onCancel}
      onConfirm={onSave}
    />
  );
}
