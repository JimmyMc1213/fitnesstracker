import { useMemo, useState, type MouseEvent } from "react";

import { localDateKey } from "./dailyPlan";
import { formatWorkoutDuration } from "./workoutSummary";
import {
  formatWorkoutHistoryDate,
  getWorkoutsForDay,
  workoutDaysInMonth,
} from "./workoutHistory";
import { IconDumbbell } from "./icons";
import { WorkoutSessionPreviewSheet } from "./WorkoutSessionPreviewSheet";
import type { AppState, CompletedWorkoutSession } from "./types";

const ACCENT_BLUE = "#0A84FF";
const WORKOUT_DAY = "#ffffff";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildMonthGrid(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DayDetailSheet({
  sessions,
  dayKey,
  onClose,
  onViewSession,
}: {
  sessions: CompletedWorkoutSession[];
  dayKey: string;
  onClose: () => void;
  onViewSession: (session: CompletedWorkoutSession) => void;
}) {
  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
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
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "min(78vh, 520px)",
          display: "flex",
          flexDirection: "column",
          background: "#121212",
          borderColor: "var(--border)",
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="between" style={{ padding: "16px 16px 12px", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
              {formatWorkoutHistoryDate(dayKey, sessions[0]?.endedAtMs ?? Date.now())}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              {sessions.length} workout{sessions.length === 1 ? "" : "s"}
            </p>
          </div>
          <button type="button" className="tap" onClick={onClose} style={{ fontSize: 14, fontWeight: 600, color: "#0A84FF", padding: 4 }}>
            Done
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className="tap"
              onClick={() => onViewSession(session)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 10,
                border: "0.5px solid var(--border)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
              }}
            >
              <div className="between" style={{ alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    {formatWorkoutDuration(session.durationSec)}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT_BLUE, flexShrink: 0 }}>View</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkoutCalendarCard({ state }: { state: AppState }) {
  const todayKey = localDateKey(new Date());
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);

  const workoutDays = useMemo(
    () => workoutDaysInMonth(state.workoutHistory, viewYear, viewMonth),
    [state.workoutHistory, viewYear, viewMonth],
  );

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedSessions = selectedDay ? getWorkoutsForDay(state.workoutHistory, selectedDay) : [];

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <>
      <div className="card" style={{ padding: 18, position: "relative" }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>{monthLabel(viewYear, viewMonth)}</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              className="tap"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "0.5px solid var(--border)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 16,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="tap"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "0.5px solid var(--border)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.04em",
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {grid.map((dayKey, i) => {
            if (!dayKey) {
              return <div key={`pad-${i}`} style={{ aspectRatio: "1", minHeight: 36 }} />;
            }
            const hasWorkout = workoutDays.has(dayKey);
            const isToday = dayKey === todayKey;
            const isFuture = dayKey > todayKey;
            const canTap = hasWorkout && !isFuture;

            return (
              <button
                key={dayKey}
                type="button"
                className={canTap ? "tap" : undefined}
                disabled={!canTap}
                onClick={() => {
                  if (!canTap) return;
                  const daySessions = getWorkoutsForDay(state.workoutHistory, dayKey);
                  if (daySessions.length === 1) setPreviewSession(daySessions[0]!);
                  else setSelectedDay(dayKey);
                }}
                style={{
                  aspectRatio: "1",
                  minHeight: 36,
                  borderRadius: 8,
                  border: isToday ? `1.5px solid rgba(255,255,255,0.35)` : "1px solid transparent",
                  background: hasWorkout ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
                  color: isFuture ? "rgba(255,255,255,0.25)" : "#fff",
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 500,
                  fontVariantNumeric: "tabular-nums",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: 0,
                  cursor: canTap ? "pointer" : "default",
                  opacity: isFuture ? 0.6 : 1,
                }}
              >
                {Number(dayKey.slice(8))}
                {hasWorkout ? (
                  <span
                    aria-hidden
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: WORKOUT_DAY,
                    }}
                  />
                ) : (
                  <span style={{ width: 5, height: 5 }} aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        {workoutDays.size === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 24,
              textAlign: "center",
              background: "rgba(10,10,10,0.72)",
              borderRadius: 12,
            }}
          >
            <IconDumbbell size={28} stroke={1.75} style={{ color: "rgba(255,255,255,0.25)" }} />
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, maxWidth: 260 }}>
              No workouts yet, finish a session in Workout to light up your calendar
            </p>
          </div>
        ) : (
          <p style={{ margin: "14px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Tap a highlighted day for your session breakdown.
          </p>
        )}
      </div>

      {selectedDay && selectedSessions.length > 0 ? (
        <DayDetailSheet
          sessions={selectedSessions}
          dayKey={selectedDay}
          onClose={() => setSelectedDay(null)}
          onViewSession={(session) => {
            setSelectedDay(null);
            setPreviewSession(session);
          }}
        />
      ) : null}

      {previewSession ? (
        <WorkoutSessionPreviewSheet session={previewSession} onClose={() => setPreviewSession(null)} />
      ) : null}
    </>
  );
}
