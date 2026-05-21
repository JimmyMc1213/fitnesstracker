import { useEffect, useRef } from "react";

import { COACH_BLUE } from "./workoutUiTokens";
import { formatRestDuration } from "./restTimerPreferences";

type Props = {
  remainingSec: number;
  durationSec: number;
  completed: boolean;
  presetLabel: string;
  onDismiss: () => void;
  onCyclePreset: () => void;
};

export function RestTimerBar({
  remainingSec,
  durationSec,
  completed,
  presetLabel,
  onDismiss,
  onCyclePreset,
}: Props) {
  const vibratedRef = useRef(false);

  useEffect(() => {
    if (!completed || vibratedRef.current) return;
    vibratedRef.current = true;
    navigator.vibrate?.([200, 100, 200]);
  }, [completed]);

  useEffect(() => {
    if (!completed) vibratedRef.current = false;
  }, [completed]);

  const progress = durationSec > 0 ? Math.max(0, Math.min(1, remainingSec / durationSec)) : 0;
  const accent = completed ? "#34C759" : COACH_BLUE;

  return (
    <div
      style={{
        marginBottom: 12,
        borderRadius: 10,
        border: `0.5px solid ${completed ? "rgba(52,199,89,0.35)" : "rgba(10,132,255,0.25)"}`,
        background: completed ? "rgba(52,199,89,0.12)" : "rgba(10,132,255,0.08)",
        padding: "10px 12px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!completed ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: `${progress * 100}%`,
            background: "rgba(10,132,255,0.12)",
            transition: "width 0.35s linear",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: completed ? "rgba(52,199,89,0.95)" : "rgba(10,132,255,0.85)",
              marginBottom: 2,
            }}
          >
            {completed ? "Rest complete" : "Rest timer"}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: accent,
              letterSpacing: "-0.02em",
            }}
          >
            {completed ? "Go!" : formatRestDuration(remainingSec)}
          </div>
        </div>
        <button
          type="button"
          className="tap"
          onClick={onCyclePreset}
          aria-label={`Rest duration ${presetLabel}, tap to change`}
          style={{
            flexShrink: 0,
            border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "6px 10px",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.72)",
            fontSize: 12,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {presetLabel} ▾
        </button>
        <button
          type="button"
          className="tap"
          onClick={onDismiss}
          aria-label="Skip rest"
          style={{
            flexShrink: 0,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 4px",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
