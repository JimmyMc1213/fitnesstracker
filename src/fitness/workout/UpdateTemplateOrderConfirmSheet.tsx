import { PrimaryButton } from "../shared";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";

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
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
      <div
        id="update-template-order-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        Update routine order?
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        You changed the exercise order during this workout. Save this order to{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{templateName}</span>?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton block onClick={onUpdate} style={{ fontWeight: 700 }}>
          Update template
        </PrimaryButton>
        <button
          type="button"
          className="tap"
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "0.5px solid var(--border-subtle, rgba(255,255,255,0.12))",
            background: "transparent",
            color: "var(--text-muted-soft)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Not now
        </button>
      </div>
    </BottomSheet>
  );
}
