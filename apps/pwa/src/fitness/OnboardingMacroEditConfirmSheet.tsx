import {
  CenterDialog,
  CONFIRM_DESTRUCTIVE_COLOR,
  CONFIRM_MODAL_BORDER,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "./motion";

const actionButtonStyle = {
  flex: 1,
  padding: "14px 12px",
  border: "none",
  background: "transparent",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "-0.01em",
} as const;

export function OnboardingMacroEditConfirmSheet({
  open = true,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const contentPadding = 28;

  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="macro-edit-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="macro-edit-confirm-title" style={confirmSheetTitleStyle}>
        Update fuel targets?
      </div>
      <p style={confirmSheetMessageStyle}>
        Changing your targets may affect how accurate your Future You looks. Continue?
      </p>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          marginLeft: -contentPadding,
          marginRight: -contentPadding,
          marginBottom: -contentPadding,
          borderTop: CONFIRM_MODAL_BORDER,
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={onCancel}
          style={{
            ...actionButtonStyle,
            color: CONFIRM_DESTRUCTIVE_COLOR,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="tap"
          onClick={onConfirm}
          style={{
            ...actionButtonStyle,
            color: "var(--ob-gold-mid)",
          }}
        >
          Continue
        </button>
      </div>
    </CenterDialog>
  );
}
