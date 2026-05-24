import type { ReactNode } from "react";

import { PrimaryButton } from "./shared";
import { BottomSheet, CenterDialog, bottomSheetPanelTheme } from "./motion";

const DESTRUCTIVE = "#FF6961";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  padding: 20,
} as const;

export function DeleteConfirmSheet({
  open = true,
  title,
  message,
  cancelLabel = "Keep",
  confirmLabel = "Delete",
  zIndex = 1100,
  placement = "bottom",
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  title: string;
  message: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  zIndex?: number;
  /** Use `center` when the sheet would sit behind the tab bar on main screens. */
  placement?: "bottom" | "center";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const content = (
    <>
      <div
        id="delete-confirm-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        {title}
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        {message}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton block onClick={onCancel} style={{ fontWeight: 700 }}>
          {cancelLabel}
        </PrimaryButton>
        <button
          type="button"
          className="tap"
          onClick={onConfirm}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "0.5px solid rgba(255,69,58,0.35)",
            background: "rgba(255,69,58,0.12)",
            color: DESTRUCTIVE,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );

  if (placement === "center") {
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
