import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";

type Props = {
  open?: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function NutritionDeleteConfirmSheet({ open = true, title, message, onCancel, onConfirm }: Props) {
  return (
    <WorkoutConfirmSheet
      open={open}
      title={title}
      message={message}
      cancelLabel="Keep"
      confirmLabel="Delete"
      confirmDestructive
      sheetTestID="nutrition-delete-confirm"
      cancelTestID="nutrition-delete-cancel"
      confirmTestID="nutrition-delete-confirm-action"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
