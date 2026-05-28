import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function ReplaceActiveWorkoutConfirmSheet({
  open = true,
  workoutTitle,
  onKeepCurrent,
  onStartNew,
}: {
  open?: boolean;
  workoutTitle: string;
  onKeepCurrent: () => void;
  onStartNew: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onKeepCurrent}
      zIndex={1300}
      ariaLabelledBy="replace-active-workout-title"
      panelStyle={confirmBottomSheetPanelStyle}
    >
      <div id="replace-active-workout-title" style={confirmSheetTitleStyle}>
        Replace active workout?
      </div>
      <p style={confirmSheetMessageStyle}>
        You have a workout in progress. Starting{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{workoutTitle}</span> will discard your current
        session progress.
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep current"
        confirmLabel="Start workout"
        confirmTone="primary"
        contentPadding={24}
        onCancel={onKeepCurrent}
        onConfirm={onStartNew}
      />
    </BottomSheet>
  );
}
