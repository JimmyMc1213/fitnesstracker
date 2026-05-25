import { useEffect, useRef, useState } from "react";

import { IconCheck } from "./icons";
import { COACH_BLUE } from "./workoutUiTokens";
import { formatRestDuration } from "./restTimerPreferences";

export type RestTimerPhase = "ready" | "running" | "complete" | "rested";

type Props = {
  phase: RestTimerPhase;
  durationSec: number;
  endsAtMs?: number;
  paused?: boolean;
  pausedRemainingMs?: number;
  displayPresetSec: number;
  onPress: () => void;
};

export function RestTimerStrip({
  phase,
  durationSec,
  endsAtMs,
  paused = false,
  pausedRemainingMs,
  displayPresetSec,
  onPress,
}: Props) {
  const endsAtRef = useRef(endsAtMs ?? 0);
  const vibratedRef = useRef(false);
  const [fillRatio, setFillRatio] = useState(1);
  const [displaySec, setDisplaySec] = useState(displayPresetSec);

  useEffect(() => {
    endsAtRef.current = endsAtMs ?? 0;
  }, [endsAtMs]);

  useEffect(() => {
    if (phase === "ready" || phase === "rested") {
      setFillRatio(1);
      setDisplaySec(displayPresetSec);
      return;
    }

    if (phase === "complete") {
      setFillRatio(1);
      setDisplaySec(0);
      return;
    }

    if (paused) {
      const remainingMs = pausedRemainingMs ?? 0;
      setFillRatio(durationSec > 0 ? remainingMs / (durationSec * 1000) : 0);
      setDisplaySec(Math.max(0, Math.ceil(remainingMs / 1000)));
      return;
    }

    if (!endsAtMs || durationSec <= 0) return;

    let raf = 0;
    const tick = () => {
      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      setFillRatio(Math.min(1, remainingMs / (durationSec * 1000)));
      setDisplaySec(Math.max(0, Math.ceil(remainingMs / 1000)));
      if (remainingMs > 0) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, endsAtMs, durationSec, displayPresetSec, paused, pausedRemainingMs]);

  useEffect(() => {
    if (phase !== "complete" || vibratedRef.current) return;
    vibratedRef.current = true;
    navigator.vibrate?.([200, 100, 200]);
  }, [phase]);

  useEffect(() => {
    if (phase !== "complete") vibratedRef.current = false;
  }, [phase]);

  const isReady = phase === "ready";
  const isRunning = phase === "running";
  const isComplete = phase === "complete";
  const isRested = phase === "rested";
  const isActive = isRunning || isComplete;

  const trackColor = isComplete
    ? "rgba(48,209,88,0.28)"
    : isRunning
      ? "rgba(10,132,255,0.22)"
      : isRested
        ? "rgba(255,255,255,0.22)"
        : "var(--border)";
  const fillColor = isComplete ? "var(--primary)" : isRunning ? COACH_BLUE : "rgba(255,255,255,0.55)";

  return (
    <button
      type="button"
      className="tap"
      onClick={onPress}
      aria-label={
        isRunning
          ? `Rest ${formatRestDuration(displaySec)}, tap to adjust`
          : isComplete
            ? "Rest complete, tap to continue"
            : isRested
              ? `Rest ${formatRestDuration(displayPresetSec)} completed`
              : `Rest ${formatRestDuration(displayPresetSec)} between sets, tap to change`
      }
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: isActive ? 26 : 20,
        margin: "2px 0",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      <div
        aria-hidden
        className={isComplete ? "rest-timer-strip__track rest-timer-strip__track--complete" : "rest-timer-strip__track"}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: isActive ? 6 : isRested ? 3 : 2,
          borderRadius: 999,
          background: trackColor,
          overflow: "hidden",
          transition: "height 0.25s ease, background 0.25s ease",
        }}
      >
        {(isRunning || isComplete || isRested) && (
          <div
            style={{
              height: "100%",
              width: "100%",
              borderRadius: 999,
              background: fillColor,
              transform: `scaleX(${isRested ? 1 : fillRatio})`,
              transformOrigin: "left center",
              transition: isReady || isComplete || isRested ? "transform 0.3s ease, background 0.25s ease" : "none",
              willChange: isRunning && !paused ? "transform" : undefined,
            }}
          />
        )}
      </div>

      {isComplete ? (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            minWidth: 72,
            padding: "4px 14px",
            borderRadius: 999,
            border: "1px solid var(--primary)",
            background: "var(--primary)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--primary-fg)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            boxShadow: "0 0 0 3px var(--card), 0 2px 10px rgba(48,209,88,0.35)",
          }}
        >
          <IconCheck size={13} stroke={2.6} />
          Go!
        </span>
      ) : (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 48,
            padding: isRunning ? "3px 11px" : isRested ? "2px 10px" : "2px 9px",
            borderRadius: 999,
            border: `1px solid ${isRunning ? COACH_BLUE : isRested ? "rgba(255,255,255,0.4)" : "var(--border-strong)"}`,
            background: "var(--card)",
            fontSize: isRunning ? 12 : isRested ? 11 : 10,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: isRunning ? COACH_BLUE : isRested ? "#FFFFFF" : "var(--text-secondary)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            transition: "background 0.25s ease, border-color 0.25s ease, color 0.25s ease, font-size 0.2s ease",
            boxShadow: isRunning
              ? "0 0 0 3px var(--card), 0 2px 8px rgba(0,0,0,0.35)"
              : isRested
                ? "0 0 0 2px var(--card), 0 0 10px rgba(255,255,255,0.08)"
                : "0 0 0 2px var(--card)",
          }}
        >
          {formatRestDuration(isRested ? displayPresetSec : displaySec)}
        </span>
      )}
    </button>
  );
}
