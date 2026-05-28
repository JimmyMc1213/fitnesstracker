import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function CancelMobilityConfirmSheet({
  open = true,
  onResume,
  onCancelSession,
}: {
  open?: boolean;
  onResume: () => void;
  onCancelSession: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onResume}
      zIndex={1300}
      ariaLabelledBy="cancel-mobility-title"
      panelStyle={confirmBottomSheetPanelStyle}
    >
      <div id="cancel-mobility-title" style={confirmSheetTitleStyle}>
        Cancel mobility session?
      </div>
      <p style={confirmSheetMessageStyle}>
        Are you sure you want to cancel this session? Your progress won&apos;t be saved.
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep going"
        confirmLabel="Cancel session"
        contentPadding={24}
        onCancel={onResume}
        onConfirm={onCancelSession}
      />
    </BottomSheet>
  );
}
