import { useEffect, useState, useId } from "react";

import {
  buildStreakCalendarWeek,
  computeFitnessCheckInStreak,
  type StreakCalendarCellKind,
} from "./dailyStreak";
import { DayProgressSheet } from "./DayProgressSheet";
import { IconDumbbell } from "./icons";
import type { AppState } from "./types";

const RED_EMPTY = "#ef4444";
const GREEN_COMPLETE = "#4ade80";

function DayLetterProgressRing({
  letter,
  progress,
  kind,
}: {
  letter: string;
  progress: number;
  kind: StreakCalendarCellKind;
}) {
  const future = kind === "future";
  const p = Math.max(0, Math.min(1, progress));
  const size = 32;
  const cx = size / 2;
  const cy = size / 2;
  const r = 12.65;
  const cLength = 2 * Math.PI * r;
  const dashLen =
    p >= 1 ? cLength - 0.5 : Math.max(cLength * p, p > 0 ? 2 : 0);

  const arcStroke = p >= 1 ? GREEN_COMPLETE : "#ffffff";

  const letterColor = future ? "rgba(255,255,255,0.35)" : "#fff";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {future ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        ) : p <= 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={RED_EMPTY} strokeWidth={2.35} strokeLinecap="round" />
        ) : (
          <>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arcStroke}
              strokeWidth={2.35}
              strokeLinecap="round"
              strokeDasharray={`${dashLen} ${cLength}`}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </>
        )}
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 11,
          fontWeight: 800,
          color: letterColor,
          letterSpacing: "-0.03em",
        }}
      >
        {letter}
      </span>
    </div>
  );
}

/** Cal-style streak pill flame (filled, not outline). */
function StreakFlameGlyph({ size = 17 }: { size?: number }) {
  const raw = useId();
  const gradId = `streakFlameGrad-${raw.replace(/[^a-zA-Z0-9_-]/g, "") || "g"}`;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s1 2 3 2c0-3-1-5 1-8z"
        stroke="#c2410c"
        strokeWidth={0.35}
      />
    </svg>
  );
}

export function StreakWeeklyHeader({ state, todayKey }: { state: AppState; todayKey: string }) {
  const streak = computeFitnessCheckInStreak(state, todayKey);
  const week = buildStreakCalendarWeek(state, todayKey);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked]);

  return (
    <div style={{ marginTop: 14, marginBottom: 14 }}>
      {picked ? <DayProgressSheet state={state} dateKey={picked} todayKey={todayKey} onClose={() => setPicked(null)} /> : null}

      <div className="between" style={{ alignItems: "center", padding: "6px 0 14px", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ flexShrink: 0, opacity: 0.95 }}>
            <IconDumbbell size={24} stroke={2} />
          </div>
          <span
            style={{
              fontFamily: "var(--ui)",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.04em",
              color: "#fff",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Fit Coach
          </span>
        </div>

        <div
          aria-label={`${streak} day streak`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 13px",
            borderRadius: 999,
            background: "rgba(250,250,252,0.97)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          <StreakFlameGlyph size={17} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0a0a0a", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {streak}
          </span>
        </div>
      </div>

      <div className="between" style={{ alignItems: "flex-start", gap: 2, padding: "0 0 2px" }}>
        {week.map((cell) => {
          const dim = cell.kind === "future";
          const domColor = dim ? "rgba(255,255,255,0.32)" : "#fff";
          const domWeight = cell.kind === "today" ? 800 : 600;

          return (
            <button
              key={cell.dateKey}
              type="button"
              className="tap"
              onClick={() => setPicked(cell.dateKey)}
              aria-label={`${cell.dateKey}, day summary`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: 0,
                margin: 0,
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                minHeight: 64,
              }}
            >
              <DayLetterProgressRing letter={cell.letter} progress={cell.progress} kind={cell.kind} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: domWeight,
                  color: domColor,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {cell.dom}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
