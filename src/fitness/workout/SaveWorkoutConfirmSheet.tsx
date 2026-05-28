import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function SaveWorkoutConfirmSheet({
  open = true,
  workoutName,
  onSave,
  onCancel,
}: {
  open?: boolean;
  workoutName: string;
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
        Your updates to{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{workoutName}</span> will replace the saved
        workout.
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
