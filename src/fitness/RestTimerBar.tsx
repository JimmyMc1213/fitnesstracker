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
  const accent = completed ? "var(--chart-stroke)" : COACH_BLUE;

  return (
    <div
      style={{
        marginBottom: 8,
        borderRadius: 8,
        border: `0.5px solid ${completed ? "var(--border-strong)" : "rgba(10,132,255,0.25)"}`,
        background: completed ? "var(--surface-3)" : "rgba(10,132,255,0.08)",
        padding: "6px 10px",
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
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: completed ? "var(--text-soft)" : "rgba(10,132,255,0.85)",
              marginBottom: 1,
              lineHeight: 1.2,
            }}
          >
            {completed ? "Rest complete" : "Rest timer"}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: accent,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
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
            border: "0.5px solid var(--sheet-panel-border)",
            borderRadius: 6,
            padding: "4px 8px",
            background: "var(--surface-3)",
            color: "var(--text-soft)",
            fontSize: 11,
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
            color: "var(--text-faint-soft)",
            fontSize: 11,
            fontWeight: 500,
            padding: "4px 2px",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
