import { useEffect, useState } from "react";

import { BottomSheet } from "./motion";

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

  useEffect(() => {
    setDraft(note);
  }, [note]);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  const canSave = Boolean(draft.trim());
  const hasExisting = Boolean(note.trim());

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="exercise-notes-edit-title"
      panelStyle={{
        width: "100%",
        maxWidth: 440,
        background: "#121212",
        borderColor: "var(--border)",
        padding: 20,
      }}
    >
        <div id="exercise-notes-edit-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 4 }}>
          Exercise note
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontWeight: 500 }}>{exerciseName}</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
          Saved to this exercise everywhere it appears, seat height, form cues, machine settings, etc.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='e.g. "seat height 3", "keep elbows in"'
          rows={4}
          autoFocus
          style={{
            background: "#1A1A1A",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            color: "#fff",
            fontFamily: "var(--ui)",
            fontSize: 15,
            fontWeight: 500,
            width: "100%",
            outline: "none",
            boxSizing: "border-box",
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
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.7)",
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
              background: canSave ? ACCENT_BLUE : "rgba(255,255,255,0.08)",
              color: canSave ? "#fff" : "rgba(255,255,255,0.35)",
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
            onClick={handleDelete}
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
  );
}
