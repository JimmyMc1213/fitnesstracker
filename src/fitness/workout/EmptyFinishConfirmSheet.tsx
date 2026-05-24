import { PrimaryButton } from "../shared";
import { BottomSheet } from "../motion";

export function EmptyFinishConfirmSheet({
  open = true,
  onKeepTraining,
  onQuit,
}: {
  open?: boolean;
  onKeepTraining: () => void;
  onQuit: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onKeepTraining}
      zIndex={1100}
      ariaLabelledBy="empty-finish-title"
      panelStyle={{
        width: "100%",
        maxWidth: 440,
        background: "#121212",
        borderColor: "var(--border)",
        padding: 20,
      }}
    >
        <div id="empty-finish-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Nothing logged yet
        </div>
        <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
          You haven&apos;t checked off any sets. Quit without saving this workout?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton block onClick={onKeepTraining} style={{ fontWeight: 700 }}>
            Keep training
          </PrimaryButton>
          <button
            type="button"
            className="tap"
            onClick={onQuit}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "0.5px solid rgba(255,69,58,0.35)",
              background: "rgba(255,69,58,0.12)",
              color: "#FF6961",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Quit workout
          </button>
        </div>
    </BottomSheet>
  );
}
