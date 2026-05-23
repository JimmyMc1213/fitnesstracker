import { useEffect, useState, type MouseEvent } from "react";

const ACCENT_BLUE = "#0A84FF";

type RepRangeEditSheetProps = {
  exerciseName: string;
  repRange: string;
  onSave: (repRange: string) => void;
  onClose: () => void;
};

export function RepRangeEditSheet({ exerciseName, repRange, onSave, onClose }: RepRangeEditSheetProps) {
  const [draft, setDraft] = useState(repRange);

  useEffect(() => {
    setDraft(repRange);
  }, [repRange]);

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSave() {
    const next = draft.trim();
    if (!next) return;
    onSave(next);
    onClose();
  }

  return (
    <div
      role="presentation"
      onMouseDown={onBackdropMouseDown}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "12px 12px calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rep-range-edit-title"
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#121212",
          borderColor: "var(--border)",
          padding: 20,
        }}
      >
        <div id="rep-range-edit-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 4 }}>
          Rep range
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontWeight: 500 }}>{exerciseName}</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
          Shown in the target label (e.g. 4 × 6-8). Saved to your routine when this workout came from a template.
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. 6-8"
          autoFocus
          style={{
            background: "#1A1A1A",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            color: "#fff",
            fontFamily: "var(--ui)",
            fontSize: 16,
            fontWeight: 500,
            width: "100%",
            outline: "none",
            boxSizing: "border-box",
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
            disabled={!draft.trim()}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: draft.trim() ? ACCENT_BLUE : "rgba(255,255,255,0.08)",
              color: draft.trim() ? "#fff" : "rgba(255,255,255,0.35)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
