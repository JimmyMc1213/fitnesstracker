import { useEffect, useRef, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { RestTimerDurationPicker } from "@/components/workout/RestTimerDurationPicker";
import {
  formatRestDuration,
  MAX_REST_TIMER_SECONDS,
  MIN_REST_TIMER_SECONDS,
} from "@/lib/workout/restTimerPreferences";
import { COACH_BLUE } from "@/lib/workoutUiTokens";
import { useAppTheme } from "@/hooks/useAppTheme";

export type RestTimerPhase = "ready" | "running" | "complete" | "rested";

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
  const { colors } = useAppTheme();
  const endsAtRef = useRef(endsAtMs ?? 0);
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

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      setDisplaySec(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    tick();
    timer = setInterval(tick, 250);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });

    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [phase, endsAtMs, durationSec, paused, pausedRemainingMs]);

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
    <CenterDialog open={open} onClose={onClose} panelStyle={{ padding: 0, maxWidth: 448 }}>
      <View testID="workout-rest-timer" className="w-full rounded-2xl p-5">
          <Text
            className="mb-1 text-[13px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {title}
          </Text>
          <Text className="mb-4 text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
            {exerciseName}
            {exerciseLabel ? (
              <Text className="ml-2 text-[10px] font-semibold uppercase" style={{ color: COACH_BLUE }}>
                {" "}
                {exerciseLabel}
              </Text>
            ) : null}
          </Text>

          <View className="mb-5 items-center">
            <View
              className="h-[120px] w-[120px] items-center justify-center rounded-full border-[3px]"
              style={{
                borderColor: isComplete ? colors.accent : isRunning ? COACH_BLUE : colors.border,
                backgroundColor: isComplete
                  ? "rgba(48,209,88,0.12)"
                  : isRunning
                    ? "rgba(10,132,255,0.06)"
                    : colors.backgroundSecondary,
              }}
            >
              <Text
                className="text-[28px] font-bold tabular-nums"
                style={{ color: isComplete ? colors.accent : isRunning ? COACH_BLUE : colors.textTertiary }}
              >
                {headline}
              </Text>
            </View>
          </View>

          {isComplete ? (
            <Text className="mb-4 text-center text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              Rest is done. Tap Done to continue.
            </Text>
          ) : null}

          <RestTimerDurationPicker variant="sheet" value={selectedPresetSec} onChange={onSelectPreset} />

          {isRunning ? (
            <View className="mb-4 flex-row gap-2">
              <Pressable
                onPress={() => onAdjustSeconds(-15)}
                disabled={displaySec <= MIN_REST_TIMER_SECONDS}
                className="flex-1 items-center rounded-[10px] border py-3"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSecondary,
                  opacity: displaySec <= MIN_REST_TIMER_SECONDS ? 0.4 : 1,
                }}
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                  −15s
                </Text>
              </Pressable>
              <Pressable
                onPress={onTogglePause}
                className="flex-1 items-center rounded-[10px] border py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                  {paused ? "Resume" : "Pause"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onAdjustSeconds(15)}
                disabled={displaySec >= MAX_REST_TIMER_SECONDS}
                className="flex-1 items-center rounded-[10px] border py-3"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSecondary,
                  opacity: displaySec >= MAX_REST_TIMER_SECONDS ? 0.4 : 1,
                }}
              >
                <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                  +15s
                </Text>
              </Pressable>
            </View>
          ) : null}

          {isRunning ? (
            <Pressable
              onPress={onRestart}
              className="mb-3 items-center rounded-[10px] border py-3"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                Restart timer
              </Text>
            </Pressable>
          ) : null}

          <PrimaryButton block onPress={handlePrimary}>
            {isComplete ? "Done" : isRunning ? "Skip rest" : "Close"}
          </PrimaryButton>
      </View>
    </CenterDialog>
  );
}
