import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "./motion";

export function SaveGoalConfirmSheet({
  open = true,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="save-goal-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="save-goal-confirm-title" style={confirmSheetTitleStyle}>
        Save goal changes?
      </div>
      <p style={confirmSheetMessageStyle}>
        Your fuel targets and goal weight range will update to match your new goal settings.
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep editing"
        confirmLabel="Save changes"
        confirmTone="primary"
        contentPadding={28}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </CenterDialog>
  );
}

export function DiscardGoalChangesConfirmSheet({
  open = true,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="discard-goal-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="discard-goal-confirm-title" style={confirmSheetTitleStyle}>
        Discard changes?
      </div>
      <p style={confirmSheetMessageStyle}>You have unsaved changes to your goal. Leave without saving?</p>
      <ConfirmSheetActions
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        contentPadding={28}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </CenterDialog>
  );
}
