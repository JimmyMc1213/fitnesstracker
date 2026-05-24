import { useEffect, useState } from "react";

import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import { workoutFieldInputStyle } from "./workoutUiTokens";

const ACCENT_BLUE = "#0A84FF";
const DESTRUCTIVE = "#FF6961";

type ExerciseNotesEditSheetProps = {
  open?: boolean;
  exerciseName: string;
  note: string;
  onSave: (note: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ExerciseNotesEditSheet({
  open = true,
  exerciseName,
  note,
  onSave,
  onDelete,
  onClose,
}: ExerciseNotesEditSheetProps) {
  const [draft, setDraft] = useState(note);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setDraft(note);
    setConfirmDeleteOpen(false);
  }, [note]);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  function handleDelete() {
    onDelete();
    setConfirmDeleteOpen(false);
    onClose();
  }

  const canSave = Boolean(draft.trim());
  const hasExisting = Boolean(note.trim());

  return (
    <>
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="exercise-notes-edit-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
        <div id="exercise-notes-edit-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}>
          Exercise note
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginBottom: 14, fontWeight: 500 }}>{exerciseName}</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
          Saved to this exercise everywhere it appears, seat height, form cues, machine settings, etc.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='e.g. "seat height 3", "keep elbows in"'
          rows={4}
          autoFocus
          style={{
            ...workoutFieldInputStyle,
            padding: "12px 14px",
            fontSize: 15,
            resize: "vertical",
            minHeight: 96,
            lineHeight: 1.45,
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className="tap"
            onClick={onClose}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "0.5px solid var(--border)",
              background: "var(--surface-3)",
              color: "var(--text-soft)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="tap"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: canSave ? ACCENT_BLUE : "var(--btn-disabled-bg)",
              color: canSave ? "var(--primary-fg)" : "var(--btn-disabled-fg)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
        {hasExisting ? (
          <button
            type="button"
            className="tap"
            onClick={() => setConfirmDeleteOpen(true)}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              border: "0.5px solid rgba(255,105,97,0.35)",
              background: "rgba(255,105,97,0.08)",
              color: DESTRUCTIVE,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Delete note
          </button>
        ) : null}
    </BottomSheet>
      {confirmDeleteOpen ? (
        <DeleteConfirmSheet
          title="Delete note?"
          cancelLabel="Keep note"
          confirmLabel="Delete note"
          zIndex={1200}
          message={
            <>
              Remove the saved note for <strong style={{ color: "var(--text-primary)" }}>{exerciseName}</strong>? This
              can&apos;t be undone.
            </>
          }
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}
