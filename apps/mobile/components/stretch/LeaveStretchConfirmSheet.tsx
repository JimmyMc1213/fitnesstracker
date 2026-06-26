import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

type Props = {
  open?: boolean;
  onKeepGoing: () => void;
  onLeave: () => void;
};

export function LeaveStretchConfirmSheet({ open = true, onKeepGoing, onLeave }: Props) {
  return (
    <WorkoutConfirmSheet
      open={open}
      title="Leave stretch?"
      message="You haven't checked off any moves. Leave without finishing the routine?"
      cancelLabel="Keep going"
      confirmLabel="Leave stretch"
      onCancel={onKeepGoing}
      onConfirm={onLeave}
    />
  );
}
