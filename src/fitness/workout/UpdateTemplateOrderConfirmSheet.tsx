import {
  BottomSheet,
  ConfirmSheetActions,
  confirmBottomSheetPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "../motion";

export function UpdateTemplateOrderConfirmSheet({
  open = true,
  templateName,
  onUpdate,
  onDismiss,
}: {
  open?: boolean;
  templateName: string;
  onUpdate: () => void;
  onDismiss: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onDismiss}
      zIndex={1100}
      ariaLabelledBy="update-template-order-title"
      panelStyle={confirmBottomSheetPanelStyle}
    >
      <div id="update-template-order-title" style={confirmSheetTitleStyle}>
        Update routine order?
      </div>
      <p style={confirmSheetMessageStyle}>
        You changed the exercise order during this workout. Save this order to{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{templateName}</span>?
      </p>
      <ConfirmSheetActions
        cancelLabel="Not now"
        confirmLabel="Update template"
        confirmTone="primary"
        contentPadding={24}
        onCancel={onDismiss}
        onConfirm={onUpdate}
      />
    </BottomSheet>
  );
}
