import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

export function SaveGoalConfirmSheet({
  open = true,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="save-goal-confirm-sheet"
      title="Save goal changes?"
      message="Your fuel targets and goal weight range will update to match your new goal settings."
      cancelLabel="Keep editing"
      confirmLabel="Save changes"
      confirmPrimary
      cancelTestID="save-goal-confirm-cancel"
      confirmTestID="save-goal-confirm-confirm"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export function DiscardGoalChangesConfirmSheet({
  open = true,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="discard-goal-confirm-sheet"
      title="Discard changes?"
      message="You have unsaved changes to your goal. Leave without saving?"
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      confirmDestructive
      cancelTestID="discard-goal-confirm-cancel"
      confirmTestID="discard-goal-confirm-confirm"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
