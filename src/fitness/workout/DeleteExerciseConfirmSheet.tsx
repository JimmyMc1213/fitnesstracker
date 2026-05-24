import { DeleteConfirmSheet } from "../DeleteConfirmSheet";

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
    <DeleteConfirmSheet
      open={open}
      title="Delete exercise?"
      cancelLabel="Keep exercise"
      confirmLabel="Delete exercise"
      message={
        <>
          Remove <strong style={{ color: "var(--text-primary)" }}>{displayName}</strong>
          {exerciseLabel?.trim() ? (
            <>
              {" "}
              <span style={{ color: "var(--text-ghost)" }}>({exerciseLabel.trim()})</span>
            </>
          ) : null}{" "}
          {fromPhrase}? This can&apos;t be undone.
        </>
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
