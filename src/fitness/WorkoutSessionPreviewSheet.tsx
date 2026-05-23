import type { MouseEvent } from "react";

import { SecondaryButton } from "./shared";
import { formatWorkoutDuration } from "./workoutSummary";
import { formatWorkoutHistoryDate } from "./workoutHistory";
import type { CompletedWorkoutSession } from "./types";

function formatSet(w: number, r: number): string {
  if (w > 0) return `${w} lb × ${r} rep${r === 1 ? "" : "s"}`;
  return `${r} rep${r === 1 ? "" : "s"}`;
}

type Props = {
  session: CompletedWorkoutSession;
  onClose: () => void;
  onDelete?: () => void;
};

export function WorkoutSessionPreviewSheet({ session, onClose, onDelete }: Props) {
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVolume = session.exercises.reduce(
    (a, e) => a + e.sets.reduce((b, st) => b + st.w * st.r, 0),
    0,
  );

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
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
        aria-labelledby="workout-session-preview-title"
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "min(78vh, 520px)",
          display: "flex",
          flexDirection: "column",
          background: "#121212",
          borderColor: "var(--border)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 16px 0", flexShrink: 0 }}>
          <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
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

          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.38)", fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
            {formatWorkoutDuration(session.durationSec)}
            {" · "}
            {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"}
            {" · "}
            {totalSets} set{totalSets === 1 ? "" : "s"}
            {totalVolume > 0 ? ` · ${totalVolume.toLocaleString()} lb·reps` : ""}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {session.exercises.map((ex, i) => (
              <div
                key={ex.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
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
                    color: "rgba(255,255,255,0.3)",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 18,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>
                    {ex.name}
                    {ex.label ? (
                      <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.4)" }}> · {ex.label}</span>
                    ) : null}
                  </div>
                  {ex.target.trim() ? (
                    <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
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
                          background: "rgba(52,199,89,0.1)",
                          border: "0.5px solid rgba(52,199,89,0.25)",
                          fontSize: 13,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Set {si + 1}</span>
                        <span style={{ color: "rgba(255,255,255,0.9)" }}>{formatSet(st.w, st.r)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 16px 16px", flexShrink: 0, borderTop: "0.5px solid var(--border)" }}>
          {onDelete ? (
            <button
              type="button"
              className="tap"
              onClick={onDelete}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "rgba(255,69,58,0.12)",
                border: "0.5px solid rgba(255,69,58,0.35)",
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                fontWeight: 600,
                color: "#FF6961",
              }}
            >
              Delete workout
            </button>
          ) : null}
          <SecondaryButton block onClick={onClose} style={{ fontWeight: 700 }}>
            Close
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
