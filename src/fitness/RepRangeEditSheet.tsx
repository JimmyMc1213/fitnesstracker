import { useEffect, useState } from "react";

import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import { workoutFieldInputStyle } from "./workoutUiTokens";

const ACCENT_BLUE = "#0A84FF";

type RepRangeEditSheetProps = {
  open?: boolean;
  exerciseName: string;
  repRange: string;
  onSave: (repRange: string) => void;
  onClose: () => void;
};

export function RepRangeEditSheet({ open = true, exerciseName, repRange, onSave, onClose }: RepRangeEditSheetProps) {
  const [draft, setDraft] = useState(repRange);

  useEffect(() => {
    setDraft(repRange);
  }, [repRange]);

  function handleSave() {
    const next = draft.trim();
    if (!next) return;
    onSave(next);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="rep-range-edit-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
      }}
    >
        <div id="rep-range-edit-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}>
          Rep range
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginBottom: 14, fontWeight: 500 }}>{exerciseName}</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
          Shown in the target label (e.g. 4 × 6-8). Saved to your workout when this session came from a template.
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. 6-8"
          autoFocus
          style={{
            ...workoutFieldInputStyle,
            padding: "12px 14px",
            fontSize: 16,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
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
            disabled={!draft.trim()}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: draft.trim() ? ACCENT_BLUE : "var(--btn-disabled-bg)",
              color: draft.trim() ? "var(--primary-fg)" : "var(--btn-disabled-fg)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
    </BottomSheet>
  );
}
