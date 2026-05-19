import type { CSSProperties } from "react";

import { IconBook } from "./icons";

const NOTE_ACCENT = "#6EB7FF";

type ExerciseNoteRowProps = {
  note: string;
  onPress: () => void;
  style?: CSSProperties;
};

export function ExerciseNoteRow({ note, onPress, style }: ExerciseNoteRowProps) {
  const trimmed = note.trim();
  const hasNote = Boolean(trimmed);

  return (
    <button
      type="button"
      className="tap"
      onClick={onPress}
      aria-label={hasNote ? "Edit exercise note" : "Add exercise note"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        width: "100%",
        marginTop: 10,
        padding: hasNote ? "10px 12px" : "8px 10px",
        borderRadius: 10,
        border: hasNote ? "0.5px solid rgba(10,132,255,0.28)" : "0.5px dashed rgba(255,255,255,0.14)",
        background: hasNote ? "rgba(10,132,255,0.08)" : "rgba(255,255,255,0.03)",
        textAlign: "left",
        ...style,
      }}
    >
      <IconBook size={15} stroke={1.8} style={{ color: NOTE_ACCENT, flexShrink: 0, marginTop: 1 }} />
      <span
        style={{
          fontSize: 12,
          fontWeight: hasNote ? 500 : 600,
          lineHeight: 1.45,
          color: hasNote ? "rgba(255,255,255,0.78)" : NOTE_ACCENT,
        }}
      >
        {hasNote ? trimmed : "Add note"}
      </span>
    </button>
  );
}
