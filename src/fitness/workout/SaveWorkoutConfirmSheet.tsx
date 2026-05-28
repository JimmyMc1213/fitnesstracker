import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";
import type { ReactNode } from "react";

export function SaveWorkoutConfirmSheet({
  open = true,
  workoutName,
  message,
  onSave,
  onCancel,
}: {
  open?: boolean;
  workoutName: string;
  message?: ReactNode;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="save-workout-confirm-title"
      panelStyle={confirmBottomSheetPanelStyle}
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
        cancelLabel="Keep editing"
        confirmLabel="Save workout"
        confirmTone="primary"
        contentPadding={24}
        onCancel={onCancel}
        onConfirm={onSave}
      />
    </BottomSheet>
  );
}
