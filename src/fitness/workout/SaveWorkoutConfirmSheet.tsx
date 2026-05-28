import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";
import type { ReactNode } from "react";

export function SaveWorkoutConfirmSheet({
  open = true,
  workoutName,
  message,
  cancelLabel = "Keep editing",
  confirmLabel = "Save workout",
  zIndex = 1400,
  onSave,
  onCancel,
}: {
  open?: boolean;
  workoutName: string;
  message?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  zIndex?: number;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={zIndex}
      ariaLabelledBy="save-workout-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="save-workout-confirm-title" style={confirmSheetTitleStyle}>
        Save changes?
      </div>
      <p style={confirmSheetMessageStyle}>
        {message ?? (
          <>
            Your updates to{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{workoutName}</span> will replace the saved
            workout.
          </>
        )}
      </p>
      <ConfirmSheetActions
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        confirmTone="primary"
        contentPadding={28}
        onCancel={onCancel}
        onConfirm={onSave}
      />
    </CenterDialog>
  );
}
