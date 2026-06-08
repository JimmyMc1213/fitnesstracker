import { useMemo, useState } from "react";

import { localDateKey } from "./dailyPlan";
import { formatWorkoutDuration } from "./workoutSummary";
import {
  formatWorkoutHistoryDate,
  getWorkoutsForDay,
  workoutDaysInMonth,
} from "./workoutHistory";
import { IconDumbbell } from "./icons";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import { WorkoutSessionPreviewSheet } from "./WorkoutSessionPreviewSheet";
import { WorkoutYearView } from "./WorkoutYearView";
import type { AppState, CompletedWorkoutSession } from "./types";

const ACCENT_BLUE = "var(--accent)";
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
  open,
  sessions,
  dayKey,
  onClose,
  onViewSession,
}: {
  open: boolean;
  sessions: CompletedWorkoutSession[];
  dayKey: string;
  onClose: () => void;
  onViewSession: (session: CompletedWorkoutSession) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 520px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
        <div className="between" style={{ padding: "16px 16px 12px", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
              {formatWorkoutHistoryDate(dayKey, sessions[0]?.endedAtMs ?? Date.now())}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-faint-soft)" }}>
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
                background: "var(--surface-1)",
                color: "var(--text-primary)",
              }}
            >
              <div className="between" style={{ alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{session.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500 }}>
                    {formatWorkoutDuration(session.durationSec)}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: ACCENT_BLUE, flexShrink: 0 }}>View</span>
              </div>
            </button>
          ))}
        </div>
    </BottomSheet>
  );
}

export function WorkoutCalendarCard({ state }: { state: AppState }) {
  const todayKey = localDateKey(new Date());
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [previewSession, setPreviewSession] = useState<CompletedWorkoutSession | null>(null);
  const [yearViewOpen, setYearViewOpen] = useState(false);

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
          <button
            type="button"
            className="tap"
            onClick={() => setYearViewOpen(true)}
            aria-label={`View ${viewYear} workout calendar`}
            style={{
              border: "none",
              padding: 0,
              background: "transparent",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {monthLabel(viewYear, viewMonth)}
          </button>
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
                background: "var(--surface-2)",
                color: "var(--text-primary)",
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
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                fontSize: 16,
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div onClick={() => setYearViewOpen(true)} style={{ cursor: "pointer" }}>
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
                color: "var(--text-ghost)",
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canTap) return;
                  const daySessions = getWorkoutsForDay(state.workoutHistory, dayKey);
                  if (daySessions.length === 1) setPreviewSession(daySessions[0]!);
                  else setSelectedDay(dayKey);
                }}
                style={{
                  aspectRatio: "1",
                  minHeight: 36,
                  borderRadius: 8,
                  border: isToday
                    ? `1.5px solid ${hasWorkout ? "rgba(255,255,255,0.55)" : "var(--border-strong)"}`
                    : "1px solid transparent",
                  background: hasWorkout ? ACCENT_BLUE : "var(--surface-1)",
                  color: hasWorkout ? "#fff" : isFuture ? "var(--text-whisper)" : "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 500,
                  fontVariantNumeric: "tabular-nums",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: canTap ? "pointer" : "default",
                  opacity: isFuture && !hasWorkout ? 0.6 : 1,
                }}
              >
                {Number(dayKey.slice(8))}
              </button>
            );
          })}
        </div>
        </div>

        {workoutDays.size === 0 ? (
          <p style={{ margin: "14px 0 0", fontSize: 11, color: "var(--text-ghost)", textAlign: "center" }}>
            <IconDumbbell size={14} stroke={1.75} style={{ verticalAlign: -2, marginRight: 4, color: "var(--text-whisper)" }} />
            No workouts yet — finish a session in Workout to light up your calendar
          </p>
        ) : (
          <p style={{ margin: "14px 0 0", fontSize: 11, color: "var(--text-ghost)" }}>
            Tap the calendar for year view · tap a blue day for your session breakdown
          </p>
        )}
      </div>

      <DayDetailSheet
        open={Boolean(selectedDay && selectedSessions.length > 0)}
        sessions={selectedSessions}
        dayKey={selectedDay ?? ""}
        onClose={() => setSelectedDay(null)}
        onViewSession={(session) => {
          setSelectedDay(null);
          setPreviewSession(session);
        }}
      />

      {previewSession ? (
        <WorkoutSessionPreviewSheet session={previewSession} onClose={() => setPreviewSession(null)} />
      ) : null}

      <WorkoutYearView
        open={yearViewOpen}
        state={state}
        initialYear={viewYear}
        onClose={() => setYearViewOpen(false)}
        onSelectMonth={(year, monthIndex) => {
          setViewYear(year);
          setViewMonth(monthIndex);
        }}
      />
    </>
  );
}
