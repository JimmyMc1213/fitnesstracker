import type { MouseEvent } from "react";

import { PrimaryButton } from "../shared";

export function EmptyFinishConfirmSheet({
  onKeepTraining,
  onQuit,
}: {
  onKeepTraining: () => void;
  onQuit: () => void;
}) {
  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onKeepTraining();
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
        aria-labelledby="empty-finish-title"
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#121212",
          borderColor: "var(--border)",
          padding: 20,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div id="empty-finish-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          Nothing logged yet
        </div>
        <p style={{ margin: "10px 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "rgba(255,255,255,0.55)" }}>
          You haven&apos;t checked off any sets. Quit without saving this workout?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton block onClick={onKeepTraining} style={{ fontWeight: 700 }}>
            Keep training
          </PrimaryButton>
          <button
            type="button"
            className="tap"
            onClick={onQuit}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "0.5px solid rgba(255,69,58,0.35)",
              background: "rgba(255,69,58,0.12)",
              color: "#FF6961",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Quit workout
          </button>
        </div>
      </div>
    </div>
  );
}
