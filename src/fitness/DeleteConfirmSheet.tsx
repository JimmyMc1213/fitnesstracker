import type { ReactNode } from "react";

import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "./motion";

export function DeleteConfirmSheet({
  open = true,
  title,
  message,
  cancelLabel = "Keep",
  confirmLabel = "Delete",
  zIndex = 1100,
  variant = "default",
  confirmBusy = false,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  title: string;
  message: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  zIndex?: number;
  confirmBusy?: boolean;
  /** Compact centered layout for delete-account confirmations. */
  variant?: "default" | "account";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  void variant;

  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={zIndex}
      ariaLabelledBy="delete-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="delete-confirm-title" style={confirmSheetTitleStyle}>
        {title}
      </div>
      <div style={confirmSheetMessageStyle}>{message}</div>
      <ConfirmSheetActions
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        confirmBusy={confirmBusy}
        contentPadding={28}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </CenterDialog>
  );
}
