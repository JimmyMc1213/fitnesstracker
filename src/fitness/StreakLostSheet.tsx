import { useId } from "react";

import { buildStreakCalendarWeek, dayEligibleForStreak } from "./dailyStreak";
import { IconCheck } from "./icons";
import { CenterDialog } from "./motion";
import type { AppState, StreakLossNotice } from "./types";

function StreakFlameGlyph({
  size = 17,
  muted = false,
}: {
  size?: number;
  muted?: boolean;
}) {
  const raw = useId();
  const gradId = `streakFlameGrad-${raw.replace(/[^a-zA-Z0-9_-]/g, "") || "g"}`;

  if (muted) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flexShrink: 0 }}>
        <path
          fill="var(--surface-4)"
          d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s1 2 3 2c0-3-1-5 1-8z"
        />
      </svg>
    );
  }

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

function WeekDayDot({
  letter,
  earned,
  kind,
}: {
  letter: string;
  earned: boolean;
  kind: "past" | "today" | "future";
}) {
  const isToday = kind === "today";
  const pastMissed = kind === "past" && !earned;
  const dayOpen = kind === "future" || kind === "today";

  let letterColor = "var(--text-primary)";
  if (kind === "future") letterColor = "var(--text-ghost)";
  else if (isToday) letterColor = "#f97316";
  else if (pastMissed) letterColor = "var(--text-faint-soft)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: letterColor, lineHeight: 1 }}>{letter}</span>
      {earned ? (
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#f97316",
            display: "grid",
            placeItems: "center",
          }}
          aria-hidden
        >
          <IconCheck size={14} stroke={2.5} style={{ color: "var(--text-primary)" }} />
        </span>
      ) : dayOpen ? (
        <span style={{ width: 28, height: 28, display: "block" }} aria-hidden />
      ) : (
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "2px solid var(--border-strong)",
            display: "block",
          }}
          aria-hidden
        />
      )}
    </div>
  );
}

type Props = {
  open: boolean;
  state: AppState;
  notice: StreakLossNotice;
  todayKey: string;
  onContinue: () => void;
};

export function StreakLostSheet({ open, state, notice, todayKey, onContinue }: Props) {
  const week = buildStreakCalendarWeek(state, todayKey);
  const lostLabel = notice.lostCount === 1 ? "1 day streak lost" : `${notice.lostCount} day streak lost`;

  return (
    <CenterDialog
      open={open}
      zIndex={280}
      ariaLabelledBy="streak-lost-title"
      panelStyle={{
        width: "100%",
        maxWidth: 360,
        padding: "18px 18px 20px",
        borderRadius: 20,
        border: "0.5px solid var(--border)",
        background: "var(--card-2)",
      }}
    >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.45 }}>
            <StreakFlameGlyph size={15} muted />
            <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>0</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <StreakFlameGlyph size={72} muted />
        </div>

        <h2
          id="streak-lost-title"
          style={{
            margin: "0 0 22px",
            textAlign: "center",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {lostLabel}
        </h2>

        <div className="between" style={{ alignItems: "flex-start", gap: 4, marginBottom: 22, padding: "0 4px" }}>
          {week.map((cell) => (
            <WeekDayDot
              key={cell.dateKey}
              letter={cell.letter}
              earned={cell.kind !== "future" && dayEligibleForStreak(state, cell.dateKey)}
              kind={cell.kind}
            />
          ))}
        </div>

        <p
          style={{
            margin: "0 0 22px",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-faint-soft)",
            lineHeight: 1.45,
          }}
        >
          Don&apos;t give up. Finish a workout or hit your nutrition target today to start again.
        </p>

        <button
          type="button"
          className="tap"
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 999,
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-fg)",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Continue
        </button>
    </CenterDialog>
  );
}
