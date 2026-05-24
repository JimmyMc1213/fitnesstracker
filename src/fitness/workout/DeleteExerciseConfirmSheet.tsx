import { PrimaryButton } from "../shared";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";

export function DeleteExerciseConfirmSheet({
  open = true,
  exerciseName,
  exerciseLabel,
  context = "workout",
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  exerciseName: string;
  exerciseLabel?: string;
  /** Where the exercise is being removed from — affects copy only. */
  context?: "workout" | "routine";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const displayName = exerciseName.trim() || "this exercise";
  const fromPhrase = context === "routine" ? "from this routine" : "from this workout";

  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      zIndex={1100}
      ariaLabelledBy="delete-exercise-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
      <div
        id="delete-exercise-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        Delete exercise?
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        Remove <strong style={{ color: "var(--text-primary)" }}>{displayName}</strong>
        {exerciseLabel?.trim() ? (
          <>
            {" "}
            <span style={{ color: "var(--text-ghost)" }}>({exerciseLabel.trim()})</span>
          </>
        ) : null}{" "}
        {fromPhrase}? This can&apos;t be undone.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton block onClick={onCancel} style={{ fontWeight: 700 }}>
          Keep exercise
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
            color: "#FF6961",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Delete exercise
        </button>
      </div>
    </BottomSheet>
  );
}
