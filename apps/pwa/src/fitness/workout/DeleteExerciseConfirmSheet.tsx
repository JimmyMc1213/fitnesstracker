import { DeleteConfirmSheet } from "../DeleteConfirmSheet";

export function DeleteExerciseConfirmSheet({
  open = true,
  exerciseName,
  exerciseLabel,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  exerciseName: string;
  exerciseLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const displayName = exerciseName.trim() || "this exercise";

  return (
    <DeleteConfirmSheet
      open={open}
      zIndex={1400}
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
          from this workout? This can&apos;t be undone.
        </>
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
