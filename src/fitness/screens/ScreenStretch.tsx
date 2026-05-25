import { useEffect, useMemo, useRef, useState } from "react";

import { arizonaCalendarDateKey, isArizonaEightPmOrLater, localDateKey } from "../dailyPlan";
import { IconChevL } from "../icons";
import { applyStretchSessionComplete } from "../mobilityHabit";
import { formatNotificationTimeDisplay } from "../notificationPreferences";
import { PrimaryButton, ScreenHeader } from "../shared";
import { STRETCH_BLOCKS, STRETCH_INTRO } from "../stretchRoutine";
import { CancelMobilityConfirmSheet } from "../stretch/CancelMobilityConfirmSheet";
import { StretchBlockCard } from "../stretch/StretchBlockCard";
import { LeaveStretchConfirmSheet } from "../stretch/LeaveStretchConfirmSheet";
import { StretchSessionHeader } from "../stretch/StretchSessionHeader";
import { StretchSessionStickyHeader } from "../stretch/StretchSessionStickyHeader";
import type { ScreenProps } from "../types";
import { closeAfterMotion, MOTION_DURATIONS } from "../motion";
import { COACH_CARD_BG, COACH_CARD_BORDER, COACH_BLUE_MUTED, labelStyle, MOBILITY_ACCENT, MOBILITY_BG, MOBILITY_BORDER } from "../workoutUiTokens";

type StretchPhase = "idle" | "active";

function formatStartedAt(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function ScreenStretch({
  state,
  setState,
  navigate,
  stretchStartRequest,
  onStretchStartRequestHandled,
}: ScreenProps) {
  const [clock, setClock] = useState(() => new Date());
  const shouldAutoStart = (stretchStartRequest ?? 0) > 0;
  const [phase, setPhase] = useState<StretchPhase>(() => (shouldAutoStart ? "active" : "idle"));
  const [sessionStartedAtMs, setSessionStartedAtMs] = useState<number | null>(() =>
    shouldAutoStart ? Date.now() : null,
  );
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showLeaveStretchConfirm, setShowLeaveStretchConfirm] = useState(false);
  const [showCancelMobilityConfirm, setShowCancelMobilityConfirm] = useState(false);
  const handledStartRequestRef = useRef(0);

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!stretchStartRequest || stretchStartRequest <= handledStartRequestRef.current) return;
    handledStartRequestRef.current = stretchStartRequest;
    setPhase("active");
    setSessionStartedAtMs(Date.now());
    onStretchStartRequestHandled?.();
  }, [stretchStartRequest, onStretchStartRequestHandled]);

  useEffect(() => {
    if (phase !== "active" || sessionStartedAtMs == null) return;
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - sessionStartedAtMs) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, sessionStartedAtMs]);

  const arizonaTodayKey = arizonaCalendarDateKey(clock);
  const localTodayKey = localDateKey(clock);
  const inEveningWindow = isArizonaEightPmOrLater(clock);
  const stretchReminderEnabled = state.notificationPreferences.nightlyStretchReminderEnabled;
  const stretchReminderTimeLabel = formatNotificationTimeDisplay(
    state.notificationPreferences.nightlyStretchReminderTime,
  );

  const completedIds = state.nightlyStretchBlockIdsByArizonaDay[arizonaTodayKey] ?? [];
  const doneCount = completedIds.filter((id) => STRETCH_BLOCKS.some((b) => b.id === id)).length;
  const totalBlocks = STRETCH_BLOCKS.length;
  const allDone = STRETCH_BLOCKS.every((b) => completedIds.includes(b.id));

  const sessionStartedAt = useMemo(() => {
    if (sessionStartedAtMs == null) return formatStartedAt(clock);
    return formatStartedAt(new Date(sessionStartedAtMs));
  }, [sessionStartedAtMs, clock]);

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

  function startSession() {
    setPhase("active");
    setSessionStartedAtMs(Date.now());
  }

  function leaveToHome(closeSheet?: () => void) {
    closeSheet?.();
    closeAfterMotion(() => navigate("home"), closeSheet ? MOTION_DURATIONS.sheetExit : 0);
  }

  function requestCancelSession() {
    setShowCancelMobilityConfirm(true);
  }

  function confirmCancelSession() {
    leaveToHome(() => setShowCancelMobilityConfirm(false));
  }

  function finishSession() {
    setState((s) => applyStretchSessionComplete(s, arizonaTodayKey, localTodayKey));
    leaveToHome();
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
    leaveToHome();
  }

  function leaveStretchEarly() {
    leaveToHome(() => setShowLeaveStretchConfirm(false));
  }

  if (phase === "idle") {
    return (
      <div key="stretch-idle" className="screen" style={{ paddingBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
          <button
            type="button"
            className="tap"
            onClick={() => navigate("home")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-soft)",
              padding: "6px 8px 6px 0",
            }}
            aria-label="Back to Home"
          >
            <IconChevL size={18} stroke={2} />
            Home
          </button>
        </div>

        <ScreenHeader eyebrow="Recovery" title="Mobility routine" subtitle="~15–20 min · low-back care & gentle mobility" />

        {inEveningWindow ? (
          <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.55, color: "var(--text-faint-soft)", fontWeight: 400 }}>
            Aim for about <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>15-20 minutes total</strong>, drift longer on what feels glued from the day.
          </p>
        ) : stretchReminderEnabled ? (
          <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.55, color: "var(--text-muted-soft)", fontWeight: 400 }}>
            Reminder at <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{stretchReminderTimeLabel}</strong>; start whenever you are ready.
          </p>
        ) : null}

        <PrimaryButton block onClick={startSession} style={{ marginTop: 20 }}>
          Start mobility routine
        </PrimaryButton>

        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 16,
            borderColor: COACH_CARD_BORDER,
            background: COACH_CARD_BG,
          }}
        >
          <div style={{ ...labelStyle, color: COACH_BLUE_MUTED, marginBottom: 8 }}>Coach note</div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-soft)", fontWeight: 500 }}>{STRETCH_INTRO}</p>
        </div>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {STRETCH_BLOCKS.map((block, index) => (
            <div
              key={block.id}
              className="card"
              style={{
                padding: "12px 14px",
                borderColor: "var(--divider-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-ghost)",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{block.title}</div>
                {block.minutes ? (
                  <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 3 }}>{block.minutes}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {doneCount > 0 ? (
          <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--text-secondary)", textAlign: "center", fontWeight: 500 }}>
            {doneCount}/{totalBlocks} moves logged today · start again to finish the routine
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div key="stretch-active" className="screen" style={{ paddingBottom: 28 }}>
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
