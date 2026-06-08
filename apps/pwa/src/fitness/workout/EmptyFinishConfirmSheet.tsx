import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function EmptyFinishConfirmSheet({
  open = true,
  onKeepTraining,
  onQuit,
}: {
  open?: boolean;
  onKeepTraining: () => void;
  onQuit: () => void;
}) {
  return (
    <CenterDialog
      open={open}
      onClose={onKeepTraining}
      zIndex={1100}
      ariaLabelledBy="empty-finish-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="empty-finish-title" style={confirmSheetTitleStyle}>
        Nothing logged yet
      </div>
      <p style={confirmSheetMessageStyle}>
        You haven&apos;t checked off any sets. Quit without saving this workout?
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep training"
        confirmLabel="Quit workout"
        contentPadding={28}
        onCancel={onKeepTraining}
        onConfirm={onQuit}
      />
    </CenterDialog>
  );
}
