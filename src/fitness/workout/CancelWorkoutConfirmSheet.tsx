import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

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
    <BottomSheet
      open={open}
      onClose={onResume}
      zIndex={1300}
      ariaLabelledBy="cancel-workout-title"
      panelStyle={confirmBottomSheetPanelStyle}
    >
      <div id="cancel-workout-title" style={confirmSheetTitleStyle}>
        Cancel workout?
      </div>
      <p style={confirmSheetMessageStyle}>
        Are you sure you want to cancel this workout? All progress will be lost.
      </p>
      <ConfirmSheetActions
        cancelLabel="Resume"
        confirmLabel="Cancel workout"
        contentPadding={24}
        onCancel={onResume}
        onConfirm={onCancelWorkout}
      />
    </BottomSheet>
  );
}
