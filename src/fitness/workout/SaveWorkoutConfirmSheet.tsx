import { PrimaryButton } from "../shared";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";

export function SaveWorkoutConfirmSheet({
  open = true,
  workoutName,
  onSave,
  onCancel,
}: {
  open?: boolean;
  workoutName: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="save-workout-confirm-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
      <div
        id="save-workout-confirm-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        Save changes?
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        Your updates to{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{workoutName}</span> will replace the saved
        workout.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton block onClick={onSave} style={{ fontWeight: 700 }}>
          Save workout
        </PrimaryButton>
        <button
          type="button"
          className="tap"
          onClick={onCancel}
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
          Keep editing
        </button>
      </div>
    </BottomSheet>
  );
}
