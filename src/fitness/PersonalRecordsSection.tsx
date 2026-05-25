import { useMemo, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  buildPersonalRecordsBoard,
  formatPersonalRecordDate,
  formatPersonalRecordSet,
  formatRecordHeroParts,
} from "./personalRecordsBoard";
import type { AppState, WeightUnit } from "./types";

const PR_GOLD = "#FFD60A";
const PR_SILVER = "#C8C8CC";
const PR_BRONZE = "#CD7F32";
const PR_ACCENT = "var(--chart-stroke)";
const TOP_N = 3;

const EMPTY_SLOT_LABELS = ["Your #1 lift", "Your #2 lift", "Your #3 lift"] as const;

type Props = {
  state: AppState;
};

export function PersonalRecordsSection({ state }: Props) {
  const wUnit = state.unitPreferences.weightUnit;
  const rows = useMemo(
    () => buildPersonalRecordsBoard(state.workoutHistory ?? []),
    [state.workoutHistory],
  );
  const topRows = rows.slice(0, TOP_N);
  const hiddenCount = Math.max(0, rows.length - TOP_N);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const isEmpty = rows.length === 0;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: "0.5px solid rgba(255,214,10,0.2)",
        background: "linear-gradient(180deg, rgba(255,214,10,0.05) 0%, transparent 36%)",
      }}
    >
      <div
        className="between"
        style={{
          padding: "10px 12px",
          borderBottom: "0.5px solid var(--border)",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,214,10,0.75)" }}>
            Top {TOP_N} records
          </div>
          {isEmpty ? (
            <div style={{ marginTop: 2, fontSize: 10, color: "var(--text-ghost)", fontWeight: 500 }}>
              Finish a workout to claim your podium
            </div>
          ) : hiddenCount > 0 ? (
            <div style={{ marginTop: 2, fontSize: 10, color: "var(--text-ghost)", fontWeight: 500 }}>
              +{hiddenCount} more tracked
            </div>
          ) : null}
        </div>
        <TrophyGlyph size={20} />
      </div>

      {isEmpty
        ? EMPTY_SLOT_LABELS.map((label, index) => (
            <PlaceholderRow key={label} rank={index + 1} label={label} isLast={index === EMPTY_SLOT_LABELS.length - 1} />
          ))
        : topRows.map((row, index) => {
        const expanded = expandedKey === row.key;
        const hero = formatRecordHeroParts(row.bestWeight, row.bestReps, wUnit);
        const rank = index + 1;
        const statLabel = hero.secondary ? `${hero.primary} ${hero.primaryUnit} ${hero.secondary}` : `${hero.primary} ${hero.primaryUnit}`;
        const isLast = index === topRows.length - 1;

        return (
          <Collapsible
            key={row.key}
            open={expanded}
            onOpenChange={(details) => setExpandedKey(details.open ? row.key : null)}
            style={{ borderBottom: !isLast || expanded ? "0.5px solid var(--border)" : undefined }}
          >
            <CollapsibleTrigger
              className="tap"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: rank === 1 ? "rgba(255,214,10,0.04)" : "transparent",
                color: "var(--text-primary)",
                textAlign: "left",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <RankBadge rank={rank} />

              <div style={{ minWidth: 0 }}>
                <div className="between" style={{ gap: 8, alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    {row.displayName}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 14,
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                      color: rank === 1 ? PR_GOLD : "var(--text-primary)",
                    }}
                  >
                    {statLabel}
                  </span>
                </div>
                <div style={{ marginTop: 2, fontSize: 10, color: "var(--text-ghost)", fontWeight: 500 }}>
                  {formatPersonalRecordDate(row.bestDateKey, row.bestEndedAtMs)}
                </div>
              </div>

              <CollapsibleIndicator
                aria-hidden
                className="collapsible-indicator--rotate-90"
                style={{
                  flexShrink: 0,
                  fontSize: 16,
                  color: "var(--text-whisper)",
                }}
              >
                ›
              </CollapsibleIndicator>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div
                style={{
                  padding: "6px 12px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                {row.history.map((entry) => (
                  <HistoryRow key={entry.endedAtMs} entry={entry} unit={wUnit} isCurrentBest={entry.endedAtMs === row.bestEndedAtMs} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function PlaceholderRow({ rank, label, isLast }: { rank: number; label: string; isLast: boolean }) {
  return (
    <div
      style={{
        borderBottom: !isLast ? "0.5px solid var(--border)" : undefined,
        padding: "10px 12px",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 10,
        alignItems: "center",
        background: rank === 1 ? "rgba(255,214,10,0.04)" : "transparent",
        opacity: 0.55,
      }}
    >
      <RankBadge rank={rank} />

      <div style={{ minWidth: 0 }}>
        <div className="between" style={{ gap: 8, alignItems: "baseline" }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "var(--text-ghost)",
            }}
          >
            {label}
          </span>
          <span
            style={{
              flexShrink: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-whisper)",
            }}
          >
            —
          </span>
        </div>
        <div style={{ marginTop: 2, fontSize: 10, color: "var(--text-whisper)", fontWeight: 500 }}>
          Log sets in Workout
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const palette =
    rank === 1
      ? { ring: PR_GOLD, bg: "rgba(255,214,10,0.14)", text: PR_GOLD }
      : rank === 2
        ? { ring: PR_SILVER, bg: "rgba(200,200,204,0.12)", text: PR_SILVER }
        : { ring: PR_BRONZE, bg: "rgba(205,127,50,0.12)", text: PR_BRONZE };

  return (
    <div
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        border: `1.5px solid ${palette.ring}`,
        background: palette.bg,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, color: palette.text, fontVariantNumeric: "tabular-nums" }}>{rank}</span>
    </div>
  );
}

function TrophyGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <path
        fill="rgba(255,214,10,0.9)"
        d="M6 4h12v2.5c0 2.5-1.6 4.6-3.8 5.3L12 18l-2.2-6.2C7.6 11.1 6 9 6 6.5V4zm-2 0v2.5C4 9.8 6.2 12.8 9 14v2H6v2h12v-2h-3v-2c2.8-1.2 5-4.2 5-7.5V4H4z"
      />
    </svg>
  );
}

function HistoryRow({
  entry,
  unit,
  isCurrentBest,
}: {
  entry: { dayKey: string; endedAtMs: number; bestWeight: number; bestReps: number; isPr: boolean };
  unit: WeightUnit;
  isCurrentBest: boolean;
}) {
  const highlight = isCurrentBest || entry.isPr;
  return (
    <div
      className="between"
      style={{
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        borderRadius: 8,
        background: highlight ? "var(--surface-3)" : "var(--surface-1)",
        border: highlight ? "0.5px solid var(--border-strong)" : "0.5px solid var(--divider-subtle)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {formatPersonalRecordSet(entry.bestWeight, entry.bestReps, unit)}
        </div>
        <div style={{ marginTop: 1, fontSize: 10, color: "var(--text-ghost)" }}>
          {formatPersonalRecordDate(entry.dayKey, entry.endedAtMs)}
        </div>
      </div>
      {isCurrentBest ? (
        <span style={badgeStyle(PR_GOLD, "rgba(255,214,10,0.15)")}>Best</span>
      ) : entry.isPr ? (
        <span style={badgeStyle(PR_ACCENT, "var(--surface-4)")}>PR</span>
      ) : null}
    </div>
  );
}

function badgeStyle(color: string, bg: string) {
  return {
    flexShrink: 0,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color,
    background: bg,
    padding: "3px 6px",
    borderRadius: 5,
  };
}
