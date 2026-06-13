import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

export function EmptyFinishConfirmSheet({
  open = true,
  onKeepTraining,
  onQuit,
}: {
  open?: boolean;
  onKeepTraining: () => void;
  onQuit: () => void;
}) {
  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="empty-finish-sheet"
      title="Nothing logged yet"
      message="You haven't checked off any sets. Quit without saving this workout?"
      cancelLabel="Keep training"
      confirmLabel="Quit workout"
      confirmDestructive
      cancelTestID="empty-finish-keep"
      confirmTestID="empty-finish-quit"
      onCancel={onKeepTraining}
      onConfirm={onQuit}
    />
  );
}
