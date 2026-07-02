import { useEffect, useRef, useState, type CSSProperties } from "react";

import { CenterDialog, bottomSheetPanelTheme } from "./motion";
import { PrimaryButton } from "./shared";
import { COACH_BLUE, COACH_GOLD_BG_SUBTLE } from "./workoutUiTokens";
import { RestTimerDurationPicker } from "./RestTimerDurationPicker";
import { formatRestDuration, MAX_REST_TIMER_SECONDS, MIN_REST_TIMER_SECONDS } from "./restTimerPreferences";
import type { RestTimerPhase } from "./RestTimerStrip";

type Props = {
  open?: boolean;
  exerciseName: string;
  exerciseLabel?: string;
  phase: RestTimerPhase;
  durationSec: number;
  endsAtMs?: number;
  paused?: boolean;
  pausedRemainingMs?: number;
  selectedPresetSec: number;
  onClose: () => void;
  onSelectPreset: (seconds: number) => void;
  onAdjustSeconds: (delta: number) => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onSkip: () => void;
  onDismiss: () => void;
};

export function RestTimerSheet({
  open = true,
  exerciseName,
  exerciseLabel,
  phase,
  durationSec,
  endsAtMs,
  paused = false,
  pausedRemainingMs,
  selectedPresetSec,
  onClose,
  onSelectPreset,
  onAdjustSeconds,
  onTogglePause,
  onRestart,
  onSkip,
  onDismiss,
}: Props) {
  const endsAtRef = useRef(endsAtMs ?? 0);
  const vibratedRef = useRef(false);
  const [displaySec, setDisplaySec] = useState(selectedPresetSec);

  useEffect(() => {
    endsAtRef.current = endsAtMs ?? 0;
  }, [endsAtMs]);

  useEffect(() => {
    if (phase === "ready") {
      setDisplaySec(durationSec);
      return;
    }
    if (phase === "complete") {
      setDisplaySec(0);
      return;
    }
    if (paused) {
      setDisplaySec(Math.max(0, Math.ceil((pausedRemainingMs ?? 0) / 1000)));
      return;
    }
    if (!endsAtMs) return;

    let raf = 0;
    const tick = () => {
      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      setDisplaySec(Math.max(0, Math.ceil(remainingMs / 1000)));
      if (remainingMs > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, endsAtMs, durationSec, paused, pausedRemainingMs]);

  useEffect(() => {
    if (phase !== "complete" || vibratedRef.current) return;
    vibratedRef.current = true;
    navigator.vibrate?.([200, 100, 200]);
  }, [phase]);

  useEffect(() => {
    if (phase !== "complete") vibratedRef.current = false;
  }, [phase]);

  const isRunning = phase === "running";
  const isComplete = phase === "complete";
  const title = isComplete ? "Rest complete" : isRunning ? "Rest timer" : "Rest between sets";
  const headline = isComplete ? "Go!" : formatRestDuration(displaySec);

  function handlePrimary() {
    if (isComplete) {
      onDismiss();
      onClose();
      return;
    }
    if (isRunning) {
      onSkip();
      onClose();
      return;
    }
    onClose();
  }

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="rest-timer-sheet-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(82vh, 560px)",
        overflowY: "auto",
        padding: 20,
      }}
    >
      <div id="rest-timer-sheet-title" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-soft)", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, letterSpacing: "-0.01em" }}>
        {exerciseName}
        {exerciseLabel ? (
          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: COACH_BLUE }}>
            {exerciseLabel}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `3px solid ${isComplete ? "var(--primary)" : isRunning ? COACH_BLUE : "var(--border)"}`,
            display: "grid",
            placeItems: "center",
            background: isComplete ? "rgba(48,209,88,0.12)" : isRunning ? COACH_GOLD_BG_SUBTLE : "var(--surface-2)",
            transition: "border-color 0.25s ease, background 0.25s ease",
            boxShadow: isComplete ? "0 0 0 8px rgba(48,209,88,0.12)" : undefined,
          }}
        >
          <span
            style={{
              fontSize: isComplete ? 32 : 28,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              color: isComplete ? "var(--primary)" : isRunning ? COACH_BLUE : "var(--text-muted-soft)",
            }}
          >
            {headline}
          </span>
        </div>
      </div>

      {isComplete ? (
        <p style={{ margin: "0 0 16px", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--text-muted-soft)", lineHeight: 1.45 }}>
          Rest is done — tap Done or the timer below to continue.
        </p>
      ) : null}

      <RestTimerDurationPicker
        variant="sheet"
        value={selectedPresetSec}
        onChange={onSelectPreset}
      />

      {isRunning ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className="tap"
            onClick={() => onAdjustSeconds(-15)}
            disabled={displaySec <= MIN_REST_TIMER_SECONDS}
            style={sheetActionStyle(displaySec <= MIN_REST_TIMER_SECONDS)}
          >
            −15s
          </button>
          <button type="button" className="tap" onClick={onTogglePause} style={sheetActionStyle(false)}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="tap"
            onClick={() => onAdjustSeconds(15)}
            disabled={displaySec >= MAX_REST_TIMER_SECONDS}
            style={sheetActionStyle(displaySec >= MAX_REST_TIMER_SECONDS)}
          >
            +15s
          </button>
        </div>
      ) : null}

      {isRunning ? (
        <button
          type="button"
          className="tap"
          onClick={onRestart}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            border: "0.5px solid var(--border)",
            background: "transparent",
            color: "var(--text-muted-soft)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Restart timer
        </button>
      ) : null}

      <PrimaryButton block onClick={handlePrimary} style={{ fontWeight: 700 }}>
        {isComplete ? "Done" : isRunning ? "Skip rest" : "Close"}
      </PrimaryButton>
    </CenterDialog>
  );
}

function sheetActionStyle(disabled: boolean): CSSProperties {
  return {
    padding: 12,
    borderRadius: 10,
    border: "0.5px solid var(--border)",
    background: disabled ? "var(--surface-2)" : "var(--surface-3)",
    color: disabled ? "var(--text-whisper)" : "var(--text-soft)",
    fontSize: 13,
    fontWeight: 600,
  };
}
