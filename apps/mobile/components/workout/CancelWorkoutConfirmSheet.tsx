import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

export function CancelWorkoutConfirmSheet({
  open = true,
  onResume,
  onCancelWorkout,
}: {
  open?: boolean;
  onResume: () => void;
  onCancelWorkout: () => void;
}) {
  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="cancel-workout-sheet"
      title="Cancel workout?"
      message="Are you sure you want to cancel this workout? All progress will be lost."
      cancelLabel="Resume"
      confirmLabel="Cancel workout"
      confirmDestructive
      cancelTestID="cancel-workout-resume"
      confirmTestID="cancel-workout-confirm"
      onCancel={onResume}
      onConfirm={onCancelWorkout}
    />
  );
}
