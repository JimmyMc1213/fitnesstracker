import type { ReactNode } from "react";

import {
  BottomSheet,
  CenterDialog,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
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
  placement = "bottom",
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
  /** Use `center` when the sheet would sit behind the tab bar on main screens. */
  placement?: "bottom" | "center";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  void variant;

  const isCenter = placement === "center";
  const panelStyle = isCenter ? confirmCenterDialogPanelStyle : confirmBottomSheetPanelStyle;
  const contentPadding = isCenter ? 28 : 24;

  const content = (
    <>
      <div id="delete-confirm-title" style={confirmSheetTitleStyle}>
        {title}
      </div>
      <p style={confirmSheetMessageStyle}>{message}</p>
      <ConfirmSheetActions
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        confirmBusy={confirmBusy}
        contentPadding={contentPadding}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </>
  );

  if (isCenter) {
    return (
      <CenterDialog open={open} onClose={onCancel} zIndex={zIndex} ariaLabelledBy="delete-confirm-title" panelStyle={panelStyle}>
        {content}
      </CenterDialog>
    );
  }

  return (
    <BottomSheet open={open} onClose={onCancel} zIndex={zIndex} ariaLabelledBy="delete-confirm-title" panelStyle={panelStyle}>
      {content}
    </BottomSheet>
  );
}
