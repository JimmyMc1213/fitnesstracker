import { useEffect, useMemo, useState } from "react";

import { arizonaCalendarDateKey, localDateKey } from "../dailyPlan";
import { applyStretchSessionComplete } from "../mobilityHabit";
import { closeAfterMotion, MOTION_DURATIONS } from "../motion";
import { STRETCH_BLOCKS } from "../stretchRoutine";
import type { AppState } from "../types";
import { MOBILITY_ACCENT, MOBILITY_BG, MOBILITY_BORDER, labelStyle } from "../workoutUiTokens";
import { CancelMobilityConfirmSheet } from "./CancelMobilityConfirmSheet";
import { LeaveStretchConfirmSheet } from "./LeaveStretchConfirmSheet";
import { StretchBlockCard } from "./StretchBlockCard";
import { StretchSessionHeader } from "./StretchSessionHeader";
import { StretchSessionStickyHeader } from "./StretchSessionStickyHeader";

function formatStartedAt(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MobilityActiveSession({
  state,
  setState,
  onClose,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onClose: () => void;
}) {
  const [clock, setClock] = useState(() => new Date());
  const [sessionStartedAtMs] = useState(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showLeaveStretchConfirm, setShowLeaveStretchConfirm] = useState(false);
  const [showCancelMobilityConfirm, setShowCancelMobilityConfirm] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - sessionStartedAtMs) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionStartedAtMs]);

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

  function leaveSession(closeSheet?: () => void) {
    if (closeSheet) {
      closeSheet();
      closeAfterMotion(onClose, MOTION_DURATIONS.sheetExit);
      return;
    }
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
    leaveSession();
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
    leaveSession();
  }

  function leaveStretchEarly() {
    leaveSession(() => setShowLeaveStretchConfirm(false));
  }

  return (
    <div className="screen" style={{ paddingBottom: 28, flex: 1, minHeight: 0, overflowY: "auto" }}>
      <StretchSessionHeader
        elapsedSec={elapsedSec}
        onFinish={requestFinishSession}
        onCancel={requestCancelSession}
        startedAt={sessionStartedAt}
        moveCount={totalBlocks}
      />

      <div
        className="card"
        style={{
          marginTop: 12,
          padding: 14,
          borderColor: MOBILITY_BORDER,
          background: MOBILITY_BG,
        }}
      >
        <div style={{ ...labelStyle, color: MOBILITY_ACCENT, marginBottom: 6 }}>Session tip</div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-soft)", fontWeight: 500 }}>
          Mark each move complete as you go. Finish saves the routine when all moves are checked.
        </p>
      </div>

      <StretchSessionStickyHeader doneMoves={doneCount} totalMoves={totalBlocks} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {STRETCH_BLOCKS.map((block, index) => (
          <StretchBlockCard
            key={block.id}
            block={block}
            blockIndex={index}
            isDone={completedIds.includes(block.id)}
            onToggleDone={() => toggleStretchBlock(block.id)}
          />
        ))}
      </div>

      {showLeaveStretchConfirm ? (
        <LeaveStretchConfirmSheet
          onKeepGoing={() => setShowLeaveStretchConfirm(false)}
          onLeave={leaveStretchEarly}
        />
      ) : null}

      {showCancelMobilityConfirm ? (
        <CancelMobilityConfirmSheet
          onResume={() => setShowCancelMobilityConfirm(false)}
          onCancelSession={confirmCancelSession}
        />
      ) : null}
    </div>
  );
}
