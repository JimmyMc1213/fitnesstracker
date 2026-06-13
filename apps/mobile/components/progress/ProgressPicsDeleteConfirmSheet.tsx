import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import type { ProgressPicGalleryItem } from "@newyouai/core";

type Props = {
  open?: boolean;
  item: ProgressPicGalleryItem | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProgressPicsDeleteConfirmSheet({ open = true, item, onCancel, onConfirm }: Props) {
  if (!item) return null;

  return (
    <WorkoutConfirmSheet
      open={open}
      title="Delete photo?"
      message={
        item.source === "weigh-in"
          ? "Remove this progress photo from your weigh-in?"
          : "Remove this photo from your gallery?"
      }
      cancelLabel="Keep photo"
      confirmLabel="Delete photo"
      confirmDestructive
      sheetTestID="progress-pics-delete-confirm"
      cancelTestID="progress-pics-delete-cancel"
      confirmTestID="progress-pics-delete-confirm-action"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
