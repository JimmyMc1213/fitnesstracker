import { Text } from "react-native";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

export function ReplaceActiveWorkoutConfirmSheet({
  open = true,
  workoutTitle,
  onKeepCurrent,
  onStartNew,
}: {
  open?: boolean;
  workoutTitle: string;
  onKeepCurrent: () => void;
  onStartNew: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="replace-active-workout-sheet"
      title="Replace active workout?"
      message={
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          You have a workout in progress. Starting{" "}
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{workoutTitle}</Text> will discard your
          current session progress.
        </Text>
      }
      cancelLabel="Keep current"
      confirmLabel="Start workout"
      confirmPrimary
      cancelTestID="replace-active-workout-keep"
      confirmTestID="replace-active-workout-start"
      onCancel={onKeepCurrent}
      onConfirm={onStartNew}
    />
  );
}
