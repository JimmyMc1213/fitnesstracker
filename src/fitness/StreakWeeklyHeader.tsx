import { useId } from "react";

import {
  buildStreakCalendarWeek,
  type StreakCalendarCellKind,
} from "./dailyStreak";
import { IconDumbbell } from "./icons";
import type { AppState } from "./types";

const GREEN_COMPLETE = "#4ade80";
const AMBER_PARTIAL = "#fbbf24";
const BLANK_RING = "rgba(255,255,255,0.1)";
const MISSED_RING = "rgba(255,255,255,0.28)";

function DayLetterProgressRing({
  letter,
  progress,
  kind,
  size = 32,
}: {
  letter: string;
  progress: number;
  kind: StreakCalendarCellKind;
  size?: number;
}) {
  const future = kind === "future";
  const pastMissed = kind === "past" && progress <= 0;
  const dayOpen = future || kind === "today";
  const p = Math.max(0, Math.min(1, progress));
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.395;
  const cLength = 2 * Math.PI * r;
  const dashLen =
    p >= 1 ? cLength - 0.5 : Math.max(cLength * p, p > 0 ? 2 : 0);

  const arcStroke = p >= 1 ? GREEN_COMPLETE : p >= 0.5 ? AMBER_PARTIAL : "#ffffff";

  let letterColor = "#fff";
  if (future) letterColor = "rgba(255,255,255,0.35)";
  else if (pastMissed) letterColor = "rgba(255,255,255,0.45)";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        {dayOpen && p <= 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={BLANK_RING} strokeWidth={1} />
        ) : pastMissed ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={MISSED_RING} strokeWidth={2} strokeLinecap="round" />
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
          fontSize: size * 0.34,
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

export function StreakWeeklyHeader({
  state,
  todayKey,
  selectedDateKey,
  onSelectDateKey,
  variant = "default",
}: {
  state: AppState;
  todayKey: string;
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  variant?: "default" | "compact";
}) {
  const streak = state.fitnessStreakSnapshot?.currentCount ?? 0;
  const week = buildStreakCalendarWeek(state, todayKey);
  const isCompact = variant === "compact";
  const ringSize = isCompact ? 28 : 32;
  const dayCellMinHeight = isCompact ? 48 : 64;

  const streakPill = (
    <div
      aria-label={`${streak} day streak`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isCompact ? 5 : 6,
        padding: isCompact ? "5px 11px" : "6px 13px",
        borderRadius: 999,
        background: "rgba(250,250,252,0.97)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      }}
    >
      <StreakFlameGlyph size={isCompact ? 15 : 17} />
      <span
        style={{
          fontSize: isCompact ? 14 : 16,
          fontWeight: 800,
          color: "#0a0a0a",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {streak}
      </span>
    </div>
  );

  return (
    <div style={{ marginTop: isCompact ? 8 : 14, marginBottom: isCompact ? 8 : 14 }}>
      {isCompact ? (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 0 6px" }}>{streakPill}</div>
      ) : (
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
          {streakPill}
        </div>
      )}

      <div className="between" style={{ alignItems: "flex-start", gap: isCompact ? 0 : 2, padding: "0 0 2px" }}>
        {week.map((cell) => {
          const isFuture = cell.kind === "future";
          const isSelected = cell.dateKey === selectedDateKey;
          const domColor = isFuture
            ? "rgba(255,255,255,0.32)"
            : cell.kind === "past" && cell.progress <= 0
              ? "rgba(255,255,255,0.45)"
              : "#fff";
          const domWeight = isSelected ? 800 : cell.kind === "today" ? 800 : 600;

          return (
            <button
              key={cell.dateKey}
              type="button"
              className="tap"
              disabled={isFuture}
              onClick={() => {
                if (!isFuture) onSelectDateKey(cell.dateKey);
              }}
              aria-label={`${cell.dateKey}${isSelected ? ", selected" : ""}`}
              aria-current={isSelected ? "date" : undefined}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: isCompact ? 3 : 5,
                padding: isCompact ? "2px 1px 4px" : "4px 2px 6px",
                margin: 0,
                background: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                border: "none",
                borderRadius: isCompact ? 10 : 12,
                color: "inherit",
                cursor: isFuture ? "default" : "pointer",
                minHeight: dayCellMinHeight,
                opacity: isFuture ? 0.55 : 1,
              }}
            >
              <DayLetterProgressRing
                letter={cell.letter}
                progress={cell.progress}
                kind={cell.kind}
                size={ringSize}
              />
              <span
                style={{
                  fontSize: isCompact ? 10 : 11,
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
