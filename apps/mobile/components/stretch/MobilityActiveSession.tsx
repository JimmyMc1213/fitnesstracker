import { arizonaCalendarDateKey, localDateKey } from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { CancelMobilityConfirmSheet } from "@/components/stretch/CancelMobilityConfirmSheet";
import { LeaveStretchConfirmSheet } from "@/components/stretch/LeaveStretchConfirmSheet";
import { StretchBlockCard } from "@/components/stretch/StretchBlockCard";
import { StretchSessionHeader } from "@/components/stretch/StretchSessionHeader";
import { StretchSessionStickyHeader } from "@/components/stretch/StretchSessionStickyHeader";
import { useSessionElapsedSec } from "@/components/workout/WorkoutSessionHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { applyStretchSessionComplete } from "@/lib/mobilityHabit";
import { STRETCH_BLOCKS } from "@/lib/stretchRoutine";
import { mobilityColors } from "@/lib/workoutUiTokens";

function formatStartedAt(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

type Props = {
  state: AppState;
  setState: (updater: AppState | ((prev: AppState) => AppState)) => void;
  onClose: () => void;
  paddingTop: number;
  paddingBottom: number;
};

export function MobilityActiveSession({ state, setState, onClose, paddingTop, paddingBottom }: Props) {
  const { colors, theme } = useAppTheme();
  const mobility = mobilityColors(theme);
  const [clock, setClock] = useState(() => new Date());
  const [sessionStartedAtMs] = useState(() => Date.now());
  const [showLeaveStretchConfirm, setShowLeaveStretchConfirm] = useState(false);
  const [showCancelMobilityConfirm, setShowCancelMobilityConfirm] = useState(false);

  const elapsedSec = useSessionElapsedSec(sessionStartedAtMs, true);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const localTodayKey = localDateKey(clock);

  const completedIds = state.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
  const doneCount = completedIds.filter((id) => STRETCH_BLOCKS.some((b) => b.id === id)).length;
  const totalBlocks = STRETCH_BLOCKS.length;
  const allDone = STRETCH_BLOCKS.every((b) => completedIds.includes(b.id));

  const sessionStartedAt = useMemo(
    () => formatStartedAt(new Date(sessionStartedAtMs)),
    [sessionStartedAtMs],
  );

  function toggleStretchBlock(blockId: string) {
    setState((s) => {
      const prev = s.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
      const has = prev.includes(blockId);
      const nextIds = has ? prev.filter((x) => x !== blockId) : [...prev, blockId];

      let nightlyKey = s.nightlyStretchCompletedArizonaKey;
      if (STRETCH_BLOCKS.every((b) => nextIds.includes(b.id))) nightlyKey = arizonaTodayKey;
      else if (nightlyKey === arizonaTodayKey) nightlyKey = null;

      const nextDayMap = { ...s.nightlyStretchBlockIdsByArizonaDay };
      if (nextIds.length === 0) delete nextDayMap[arizonaTodayKey];
      else nextDayMap[arizonaTodayKey] = nextIds;

      return {
        ...s,
        nightlyStretchBlockIdsByArizonaDay: nextDayMap,
        nightlyStretchCompletedArizonaKey: nightlyKey,
      };
    });
  }

  function leaveSession(afterClose?: () => void) {
    afterClose?.();
    onClose();
  }

  function requestCancelSession() {
    setShowCancelMobilityConfirm(true);
  }

  function confirmCancelSession() {
    leaveSession(() => setShowCancelMobilityConfirm(false));
  }

  function finishSession() {
    setState((s) => applyStretchSessionComplete(s, arizonaTodayKey, localTodayKey));
    onClose();
  }

  function requestFinishSession() {
    if (allDone) {
      finishSession();
      return;
    }
    if (doneCount === 0) {
      setShowLeaveStretchConfirm(true);
      return;
    }
    onClose();
  }

  function leaveStretchEarly() {
    leaveSession(() => setShowLeaveStretchConfirm(false));
  }

  return (
    <View testID="mobility-active-session" className="absolute inset-0" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingTop, paddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <StretchSessionHeader
          elapsedSec={elapsedSec}
          onFinish={requestFinishSession}
          onCancel={requestCancelSession}
          startedAt={sessionStartedAt}
          moveCount={totalBlocks}
        />

        <View
          className="mt-3 rounded-[10px] border px-3.5 py-3"
          style={{ borderColor: mobility.border, backgroundColor: mobility.bg }}
        >
          <Text className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: mobility.accent }}>
            Session tip
          </Text>
          <Text className="text-[13px] leading-[1.5] font-medium" style={{ color: colors.textSecondary }}>
            Mark each move complete as you go. Finish saves the routine when all moves are checked.
          </Text>
        </View>

        <StretchSessionStickyHeader doneMoves={doneCount} totalMoves={totalBlocks} />

        <View className="mt-4 gap-3">
          {STRETCH_BLOCKS.map((block, index) => (
            <StretchBlockCard
              key={block.id}
              block={block}
              blockIndex={index}
              isDone={completedIds.includes(block.id)}
              onToggleDone={() => toggleStretchBlock(block.id)}
            />
          ))}
        </View>
      </ScrollView>

      <LeaveStretchConfirmSheet
        open={showLeaveStretchConfirm}
        onKeepGoing={() => setShowLeaveStretchConfirm(false)}
        onLeave={leaveStretchEarly}
      />

      <CancelMobilityConfirmSheet
        open={showCancelMobilityConfirm}
        onResume={() => setShowCancelMobilityConfirm(false)}
        onCancelSession={confirmCancelSession}
      />
    </View>
  );
}
