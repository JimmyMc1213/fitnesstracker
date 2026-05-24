import { useState } from "react";

import { IconCheck } from "./icons";
import {
  formatDayHeading,
  getDayHabitProgress,
  getDayStreakSummary,
  type StreakDayStatus,
} from "./dailyStreak";
import type { AppState, TabId } from "./types";
import { BottomSheet } from "./motion";

function streakStatusLabel(status: StreakDayStatus): string {
  switch (status) {
    case "earned":
      return "Counts toward streak";
    case "not_yet":
      return "Streak not earned yet";
    case "missed":
      return "Did not count";
    default:
      return "Upcoming";
  }
}

function RowCheck({ done }: { done: boolean }) {
  if (done) {
    return (
      <span aria-hidden style={{ color: "var(--text-soft)", display: "flex" }}>
        <IconCheck size={14} stroke={2.25} />
      </span>
    );
  }
  return (
    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-ghost)", fontVariantNumeric: "tabular-nums" }}>
      , 
    </span>
  );
}

function HabitListBlock({ title, lines, muted }: { title: string; lines: string[]; muted?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
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
              color: muted ? "var(--text-faint-soft)" : "var(--text-primary)",
              lineHeight: 1.35,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 2, opacity: muted ? 0.45 : 0.92 }}>
              {muted ? (
                <span style={{ width: 16, height: 16, borderRadius: 999, border: "1px solid var(--border-strong)", display: "block" }} />
              ) : (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: "var(--surface-4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <IconCheck size={10} stroke={2.25} style={{ color: "var(--text-soft)" }} />
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
  open = true,
  state,
  dateKey,
  todayKey,
  onClose,
  onNavigate,
}: {
  open?: boolean;
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

  return (
    <BottomSheet
      key={dateKey}
      open={open}
      onClose={onClose}
      zIndex={1000}
      ariaLabelledBy="day-progress-title"
      backdropStyle={{
        padding: "12px 12px calc(24px + env(safe-area-inset-bottom, 0px))",
      }}
      panelStyle={{
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(82vh, 560px)",
        overflow: "auto",
        padding: "18px 18px 20px",
        background: "#121212",
        borderColor: "var(--border)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
      }}
    >
        <div className="between" style={{ alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div id="day-progress-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", flex: 1, minWidth: 0 }}>
            {formatDayHeading(dateKey)}
          </div>
          <button type="button" className="tap" onClick={onClose} aria-label="Close" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-faint-soft)" }}>
            Done
          </button>
        </div>

        {isFuture ? (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
            This day hasn&apos;t started yet.
          </p>
        ) : (
          <>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 500, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
              {streakStatusLabel(streak.status)}. Finish a workout or hit 90% of calories and protein.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="between" style={{ alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Workout finished</span>
                <RowCheck done={streak.workoutDone} />
              </div>
              <div>
                <div className="between" style={{ alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Nutrition goal</span>
                  <RowCheck done={streak.nutritionGoalHit} />
                </div>
                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500, color: "var(--text-ghost)", fontVariantNumeric: "tabular-nums" }}>
                  {streak.nutritionCalPct}% cal · {streak.nutritionProteinPct}% protein
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "0.5px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                type="button"
                className="tap"
                onClick={() => setShowFullLog((v) => !v)}
                style={{
                  padding: 0,
                  border: "none",
                  background: "none",
                  color: "var(--text-muted-soft)",
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                {showFullLog ? "Hide day log" : "Day log"}
              </button>
              {onNavigate ? (
                <button
                  type="button"
                  className="tap"
                  onClick={() => {
                    onNavigate("home");
                    onClose();
                  }}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "none",
                    color: "var(--text-muted-soft)",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                >
                  Home habits
                </button>
              ) : null}
            </div>

            {showFullLog && habits ? (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "0.5px solid var(--border)" }}>
                <div style={{ marginBottom: 4 }}>
                  <div className="label" style={{ marginBottom: 6 }}>
                    Calories logged
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                    {Math.round(habits.calories)}
                    <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 6, color: "var(--text-ghost)" }}>kcal</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-ghost)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                    P {Math.round(habits.protein)} · C {Math.round(habits.carbs)} · F {Math.round(habits.fat)} g
                  </div>
                </div>

                <HabitListBlock title="Complete" lines={habits.items.filter((i) => i.done).map((i) => i.label)} />
                <HabitListBlock title="Not yet" lines={habits.items.filter((i) => !i.done).map((i) => i.label)} muted />
              </div>
            ) : null}
          </>
        )}
    </BottomSheet>
  );
}
