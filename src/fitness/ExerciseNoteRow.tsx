import { useState, type CSSProperties } from "react";

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
  const [open, setOpen] = useState(false);

  if (!hasNote) {
    return (
      <button
        type="button"
        className="tap"
        onClick={onPress}
        aria-label="Add exercise note"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          width: "100%",
          marginTop: 10,
          padding: "8px 10px",
          borderRadius: 10,
          border: "0.5px dashed rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.03)",
          textAlign: "left",
          ...style,
        }}
      >
        <IconBook size={15} stroke={1.8} style={{ color: NOTE_ACCENT, flexShrink: 0, marginTop: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.45, color: NOTE_ACCENT }}>Add note</span>
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: 10,
        borderRadius: 10,
        border: "0.5px solid rgba(10,132,255,0.28)",
        background: "rgba(10,132,255,0.08)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <button
          type="button"
          className="tap"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Hide exercise note" : "Show exercise note"}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 12px",
            border: "none",
            background: open ? "rgba(255,255,255,0.04)" : "transparent",
            textAlign: "left",
            minWidth: 0,
          }}
        >
          <IconBook size={15} stroke={1.8} style={{ color: NOTE_ACCENT, flexShrink: 0, marginTop: 1 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(110,183,255,0.85)",
                marginBottom: open ? 6 : 0,
              }}
            >
              Note
            </span>
            {open ? (
              <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.45, color: "rgba(255,255,255,0.78)" }}>{trimmed}</span>
            ) : null}
          </span>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: NOTE_ACCENT, marginLeft: 8 }}>
            {open ? "Hide" : "Show"}
          </span>
        </button>
        <button
          type="button"
          className="tap"
          onClick={onPress}
          aria-label="Edit exercise note"
          style={{
            flexShrink: 0,
            padding: "10px 12px",
            border: "none",
            borderLeft: "0.5px solid rgba(10,132,255,0.2)",
            background: "transparent",
            color: NOTE_ACCENT,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
