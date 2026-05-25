import { PrimaryButton } from "../shared";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";

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
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
      <div id="cancel-mobility-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
        Cancel mobility session?
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        Are you sure you want to cancel this session? Your progress won't be saved.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          className="tap"
          onClick={onCancelSession}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "0.5px solid var(--workout-danger-border)",
            background: "var(--workout-danger-bg)",
            color: "var(--workout-danger-fg)",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Cancel session
        </button>
        <PrimaryButton block onClick={onResume} style={{ fontWeight: 700 }}>
          Keep going
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
