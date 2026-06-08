import type { CSSProperties } from "react";

import { SECONDARY_ACTION_COLOR, USER_NOTE_GRAY } from "./workoutUiTokens";

type ExerciseNoteRowProps = {
  note: string;
  onPress: () => void;
  style?: CSSProperties;
};

/** Muted “Add note” affordance on live workout exercise cards (FTI-19). */
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
        padding: "4px 0",
        border: "none",
        background: "transparent",
        fontSize: 12,
        fontWeight: 500,
        color: hasNote ? USER_NOTE_GRAY : SECONDARY_ACTION_COLOR,
        textAlign: "left",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {hasNote ? trimmed : "Add note"}
    </button>
  );
}
