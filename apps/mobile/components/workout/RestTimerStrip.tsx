import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { formatRestDuration } from "@/lib/workout/restTimerPreferences";
import { WORKOUT_ACCENT, WORKOUT_ACCENT_TRACK } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

export type RestTimerStripPhase = "ready" | "running" | "complete" | "rested";

type Props = {
  phase: RestTimerStripPhase;
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
  const { colors } = useAppTheme();
  const endsAtRef = useRef(endsAtMs ?? 0);
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

    const tick = () => {
      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      setFillRatio(Math.min(1, remainingMs / (durationSec * 1000)));
      setDisplaySec(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [phase, endsAtMs, durationSec, displayPresetSec, paused, pausedRemainingMs]);

  const isRunning = phase === "running";
  const isComplete = phase === "complete";
  const isRested = phase === "rested";
  const isActive = isRunning || isComplete;

  const trackColor = isComplete
    ? "rgba(48,209,88,0.28)"
    : isRunning
      ? WORKOUT_ACCENT_TRACK
      : isRested
        ? "rgba(255,255,255,0.22)"
        : colors.border;
  const fillColor = isComplete ? colors.accent : isRunning ? WORKOUT_ACCENT : "rgba(255,255,255,0.55)";
  const trackHeight = isActive ? 6 : isRested ? 3 : 2;
  const label = formatRestDuration(isRested ? displayPresetSec : displaySec);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Rest ${label}, tap to adjust`}
      className="my-0.5 h-5 w-full items-center justify-center"
    >
      <View
        pointerEvents="none"
        className="absolute left-0 right-0"
        style={{
          top: "50%",
          marginTop: -trackHeight / 2,
          height: trackHeight,
          borderRadius: 999,
          backgroundColor: trackColor,
          overflow: "hidden",
        }}
      >
        {isRunning || isComplete || isRested ? (
          <View
            style={{
              height: "100%",
              width: `${Math.max(0, Math.min(100, (isRested ? 1 : fillRatio) * 100))}%`,
              borderRadius: 999,
              backgroundColor: fillColor,
            }}
          />
        ) : null}
      </View>

      {isComplete ? (
        <View
          className="z-10 min-w-[72px] flex-row items-center justify-center gap-1 rounded-full px-3.5 py-1"
          style={{ backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent }}
        >
          <Text className="text-xs font-bold" style={{ color: colors.background }}>
            ✓ Go!
          </Text>
        </View>
      ) : (
        <View
          className="z-10 min-w-[48px] items-center justify-center rounded-full px-2.5 py-0.5"
          style={{
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: isRunning ? WORKOUT_ACCENT : isRested ? "rgba(255,255,255,0.4)" : colors.border,
          }}
        >
          <Text
            className="text-[10px] font-bold tabular-nums"
            style={{ color: isRunning || phase === "ready" ? WORKOUT_ACCENT : isRested ? "#FFFFFF" : colors.textSecondary }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
