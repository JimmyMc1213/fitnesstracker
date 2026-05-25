import { PrimaryButton } from "../shared";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";

export function CancelWorkoutConfirmSheet({
  open = true,
  onResume,
  onCancelWorkout,
}: {
  open?: boolean;
  onResume: () => void;
  onCancelWorkout: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onResume}
      zIndex={1300}
      ariaLabelledBy="cancel-workout-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
      <div id="cancel-workout-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
        Cancel workout?
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        Are you sure you want to cancel this workout? All progress will be lost.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          className="tap"
          onClick={onCancelWorkout}
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
          Cancel workout
        </button>
        <PrimaryButton block onClick={onResume} style={{ fontWeight: 700 }}>
          Resume
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
