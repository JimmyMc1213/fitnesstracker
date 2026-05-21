import { useState } from "react";

import { IconCheck } from "./icons";

import type { MouseEvent } from "react";

import {
  formatDayHeading,
  getDayHabitProgress,
  getDayStreakSummary,
  type StreakDayStatus,
} from "./dailyStreak";
import type { AppState, TabId } from "./types";

function streakStatusCopy(status: StreakDayStatus): { title: string; subtitle: string; accent: string } {
  switch (status) {
    case "earned":
      return {
        title: "Streak day",
        subtitle: "Workout or nutrition goal — you're covered.",
        accent: "rgba(74,222,128,0.22)",
      };
    case "not_yet":
      return {
        title: "Not yet",
        subtitle: "Finish a workout or hit 90% of calories + protein to keep the streak.",
        accent: "rgba(251,191,36,0.18)",
      };
    case "missed":
      return {
        title: "Missed",
        subtitle: "No workout and nutrition goal wasn't hit this day.",
        accent: "rgba(239,68,68,0.16)",
      };
    default:
      return { title: "Upcoming", subtitle: "This day hasn't started yet.", accent: "rgba(255,255,255,0.06)" };
  }
}

function SignalRow({ label, done, detail }: { label: string; done: boolean; detail?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: "0.5px solid var(--border)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: done ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
          border: done ? "none" : "1px solid rgba(255,255,255,0.18)",
        }}
      >
        {done ? <IconCheck size={12} stroke={2.25} style={{ color: "#4ade80" }} /> : null}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 650, color: "#fff", lineHeight: 1.25 }}>{label}</div>
        {detail ? (
          <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.42)", marginTop: 3, lineHeight: 1.35 }}>
            {detail}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HabitListBlock({ title, lines, muted }: { title: string; lines: string[]; muted?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <div className="label" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {lines.map((t, i) => (
          <li
            key={`${title}-${i}-${t}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 13,
              fontWeight: muted ? 500 : 600,
              color: muted ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.9)",
              lineHeight: 1.35,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 2, opacity: muted ? 0.45 : 0.92 }}>
              {muted ? (
                <span style={{ width: 16, height: 16, borderRadius: 999, border: "1px solid rgba(255,255,255,0.28)", display: "block" }} />
              ) : (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "rgba(74,222,128,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <IconCheck size={10} stroke={2.25} style={{ color: "#4ade80" }} />
                </span>
              )}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DayProgressSheet({
  state,
  dateKey,
  todayKey,
  onClose,
  onNavigate,
}: {
  state: AppState;
  dateKey: string;
  todayKey: string;
  onClose: () => void;
  onNavigate?: (tab: TabId) => void;
}) {
  const [showFullLog, setShowFullLog] = useState(false);
  const isFuture = dateKey > todayKey;
  const streak = getDayStreakSummary(state, dateKey, todayKey);
  const habits = isFuture ? null : getDayHabitProgress(state, dateKey);
  const hero = streakStatusCopy(streak.status);

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
        zIndex: 1000,
        background: "rgba(0,0,0,0.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "12px 12px calc(24px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        key={dateKey}
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-progress-title"
        className="card page-transition"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "min(82vh, 560px)",
          overflow: "auto",
          padding: "18px 18px 20px",
          background: "#121212",
          borderColor: "var(--border)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="between" style={{ alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div id="day-progress-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", flex: 1, minWidth: 0 }}>
            {formatDayHeading(dateKey)}
          </div>
          <button type="button" className="tap" onClick={onClose} aria-label="Close" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
            Done
          </button>
        </div>

        {isFuture ? (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.42)", lineHeight: 1.45 }}>
            This day hasn&apos;t started yet — check back when it arrives.
          </p>
        ) : (
          <>
            <div
              style={{
                borderRadius: 14,
                padding: "16px 16px 14px",
                background: hero.accent,
                border: "0.5px solid var(--border)",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--tertiary)", fontWeight: 600, marginBottom: 6 }}>
                STREAK
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1 }}>
                {hero.title}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
                {hero.subtitle}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SignalRow label="Workout finished" done={streak.workoutDone} />
              <SignalRow
                label="Nutrition goal"
                done={streak.nutritionGoalHit}
                detail={`${streak.nutritionCalPct}% calories · ${streak.nutritionProteinPct}% protein (90% to hit)`}
              />
            </div>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="tap"
                onClick={() => setShowFullLog((v) => !v)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "0.5px solid var(--border)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 13,
                  fontWeight: 650,
                  textAlign: "left",
                }}
              >
                {showFullLog ? "Hide full day log" : "See full day log"}
              </button>
              {onNavigate ? (
                <button
                  type="button"
                  className="tap"
                  onClick={() => {
                    onNavigate("habits");
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Open Habits tab →
                </button>
              ) : null}
            </div>

            {showFullLog && habits ? (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "0.5px solid var(--border)",
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    border: "0.5px solid var(--border)",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--tertiary)", fontWeight: 500 }}>
                    CALORIES (LOGGED)
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(habits.calories)}
                    <span style={{ fontSize: 12, fontWeight: 550, marginLeft: 6, color: "rgba(255,255,255,0.4)" }}>kcal</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 550, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    P {Math.round(habits.protein)} · C {Math.round(habits.carbs)} · F {Math.round(habits.fat)} g
                  </div>
                </div>

                <HabitListBlock title="Complete" lines={habits.items.filter((i) => i.done).map((i) => i.label)} />
                <HabitListBlock title="Not yet" lines={habits.items.filter((i) => !i.done).map((i) => i.label)} muted />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
