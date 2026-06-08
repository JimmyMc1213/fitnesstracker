import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function LeaveStretchConfirmSheet({
  open = true,
  onKeepGoing,
  onLeave,
}: {
  open?: boolean;
  onKeepGoing: () => void;
  onLeave: () => void;
}) {
  return (
    <CenterDialog
      open={open}
      onClose={onKeepGoing}
      zIndex={1100}
      ariaLabelledBy="leave-stretch-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="leave-stretch-title" style={confirmSheetTitleStyle}>
        Leave stretch?
      </div>
      <p style={confirmSheetMessageStyle}>
        You haven&apos;t checked off any moves. Leave without finishing the routine?
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep going"
        confirmLabel="Leave stretch"
        contentPadding={28}
        onCancel={onKeepGoing}
        onConfirm={onLeave}
      />
    </CenterDialog>
  );
}
