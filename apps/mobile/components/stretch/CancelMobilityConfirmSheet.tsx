import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

type Props = {
  open?: boolean;
  onResume: () => void;
  onCancelSession: () => void;
};

export function CancelMobilityConfirmSheet({ open = true, onResume, onCancelSession }: Props) {
  return (
    <WorkoutConfirmSheet
      open={open}
      title="Cancel mobility session?"
      message="Are you sure you want to cancel this session? Your progress won't be saved."
      cancelLabel="Keep going"
      confirmLabel="Cancel session"
      confirmDestructive
      onCancel={onResume}
      onConfirm={onCancelSession}
    />
  );
}
