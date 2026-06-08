import {
  CenterDialog,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "./motion";
import {
  FUTURE_YOU_REPLACE_CANCEL_LABEL,
  FUTURE_YOU_REPLACE_DELETE_LABEL,
  FUTURE_YOU_REPLACE_DIALOG_BODY,
  FUTURE_YOU_REPLACE_DIALOG_TITLE,
  FUTURE_YOU_REPLACE_KEEP_LABEL,
} from "./futureYouPageModel";

type Props = {
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onDeleteOld: () => void;
  onKeepOld: () => void;
};

export function FutureYouReplaceDialog({ open, busy = false, onCancel, onDeleteOld, onKeepOld }: Props) {
  return (
    <CenterDialog
      open={open}
      onClose={busy ? undefined : onCancel}
      zIndex={1300}
      ariaLabelledBy="future-you-replace-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="future-you-replace-title" style={confirmSheetTitleStyle}>
        {FUTURE_YOU_REPLACE_DIALOG_TITLE}
      </div>
      <p style={confirmSheetMessageStyle}>{FUTURE_YOU_REPLACE_DIALOG_BODY}</p>

      <div className="future-you-replace-dialog__actions" role="group" aria-label="Choose how to update NewYou">
        <button
          type="button"
          className="tap future-you-replace-dialog__action future-you-replace-dialog__action--primary"
          disabled={busy}
          onClick={onKeepOld}
        >
          {FUTURE_YOU_REPLACE_KEEP_LABEL}
        </button>
        <button
          type="button"
          className="tap future-you-replace-dialog__action future-you-replace-dialog__action--destructive"
          disabled={busy}
          onClick={onDeleteOld}
        >
          {busy ? "Removing…" : FUTURE_YOU_REPLACE_DELETE_LABEL}
        </button>
        <button
          type="button"
          className="tap future-you-replace-dialog__action future-you-replace-dialog__action--cancel"
          disabled={busy}
          onClick={onCancel}
        >
          {FUTURE_YOU_REPLACE_CANCEL_LABEL}
        </button>
      </div>
    </CenterDialog>
  );
}
