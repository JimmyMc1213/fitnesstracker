import { SecondaryButton } from "./shared";
import { formatWorkoutDuration } from "./workoutSummary";
import { formatWorkoutHistoryDate } from "./workoutHistory";
import type { CompletedWorkoutSession } from "./types";
import { CenterDialog, bottomSheetPanelTheme } from "./motion";

function formatSet(w: number, r: number): string {
  if (w > 0) return `${w} lb × ${r} rep${r === 1 ? "" : "s"}`;
  return `${r} rep${r === 1 ? "" : "s"}`;
}

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  maxHeight: "min(82vh, 560px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: 0,
} as const;

type Props = {
  open?: boolean;
  session: CompletedWorkoutSession;
  onClose: () => void;
  onDelete?: () => void;
};

export function WorkoutSessionPreviewSheet({ open = true, session, onClose, onDelete }: Props) {
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVolume = session.exercises.reduce(
    (a, e) => a + e.sets.reduce((b, st) => b + st.w * st.r, 0),
    0,
  );

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="workout-session-preview-title"
      panelStyle={panelStyle}
    >
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-ghost)",
                marginBottom: 4,
              }}
            >
              {formatWorkoutHistoryDate(session.dayKey, session.endedAtMs)}
            </div>
            <div id="workout-session-preview-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              {session.title}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-ghost)", fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
          {formatWorkoutDuration(session.durationSec)}
          {" · "}
          {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"}
          {" · "}
          {totalSets} set{totalSets === 1 ? "" : "s"}
          {totalVolume > 0 ? ` · ${totalVolume.toLocaleString()} lb·reps` : ""}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {session.exercises.map((ex, i) => (
            <div
              key={ex.id}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-ghost)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 18,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {ex.name}
                  {ex.label ? (
                    <span style={{ fontWeight: 500, color: "var(--text-ghost)" }}> · {ex.label}</span>
                  ) : null}
                </div>
                {ex.target.trim() ? (
                  <div style={{ marginTop: 2, fontSize: 11, color: "var(--text-ghost)", fontWeight: 500 }}>
                    Target {ex.target}
                  </div>
                ) : null}
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {ex.sets.map((st, si) => (
                    <div
                      key={`${ex.id}-${si}`}
                      className="between"
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "var(--surface-3)",
                        border: "0.5px solid var(--border-strong)",
                        fontSize: 13,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500 }}>Set {si + 1}</span>
                      <span style={{ color: "var(--text-primary)" }}>{formatSet(st.w, st.r)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 20px", flexShrink: 0, borderTop: "0.5px solid var(--border)" }}>
        <SecondaryButton block onClick={onClose} style={{ fontWeight: 700 }}>
          Close
        </SecondaryButton>
        {onDelete ? (
          <button
            type="button"
            className="tap"
            onClick={onDelete}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 8,
              background: "transparent",
              border: "none",
              color: "#FF6961",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Delete workout
          </button>
        ) : null}
      </div>
    </CenterDialog>
  );
}
