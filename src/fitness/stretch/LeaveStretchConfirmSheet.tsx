import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
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
    <BottomSheet
      open={open}
      onClose={onKeepGoing}
      zIndex={1100}
      ariaLabelledBy="leave-stretch-title"
      panelStyle={confirmBottomSheetPanelStyle}
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
        contentPadding={24}
        onCancel={onKeepGoing}
        onConfirm={onLeave}
      />
    </BottomSheet>
  );
}
