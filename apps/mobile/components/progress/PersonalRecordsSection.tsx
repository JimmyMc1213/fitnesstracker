import {
  buildPersonalRecordsBoard,
  formatPersonalRecordDate,
  formatPersonalRecordSet,
  formatRecordHeroParts,
  type PersonalRecordHistoryEntry,
} from "@newyouai/core";
import type { AppState, WeightUnit } from "@newyouai/types";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

const PR_GOLD = "#FFD60A";
const PR_SILVER = "#C8C8CC";
const PR_BRONZE = "#CD7F32";
const TOP_N = 3;
const EMPTY_SLOT_LABELS = ["Your #1 lift", "Your #2 lift", "Your #3 lift"] as const;

type Props = {
  state: AppState;
};

export function PersonalRecordsSection({ state }: Props) {
  const { colors } = useAppTheme();
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
    <View
      testID="progress-pr-board"
      className="overflow-hidden rounded-[14px] border"
      style={{ borderColor: "rgba(255,214,10,0.2)", backgroundColor: colors.card }}
    >
      <View
        className="flex-row items-center justify-between gap-2.5 border-b px-3 py-2.5"
        style={{ borderColor: colors.border }}
      >
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,214,10,0.75)" }}>
            Top {TOP_N} records
          </Text>
          {isEmpty ? (
            <Text className="mt-0.5 text-[10px] font-medium" style={{ color: colors.textTertiary }}>
              Finish a workout to claim your podium
            </Text>
          ) : hiddenCount > 0 ? (
            <Text className="mt-0.5 text-[10px] font-medium" style={{ color: colors.textTertiary }}>
              +{hiddenCount} more tracked
            </Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 18 }}>🏆</Text>
      </View>

      {isEmpty
        ? EMPTY_SLOT_LABELS.map((label, index) => (
            <PlaceholderRow
              key={label}
              rank={index + 1}
              label={label}
              isLast={index === EMPTY_SLOT_LABELS.length - 1}
              borderColor={colors.border}
              textTertiary={colors.textTertiary}
            />
          ))
        : topRows.map((row, index) => {
            const expanded = expandedKey === row.key;
            const hero = formatRecordHeroParts(row.bestWeight, row.bestReps, wUnit);
            const rank = index + 1;
            const statLabel = hero.secondary
              ? `${hero.primary} ${hero.primaryUnit} ${hero.secondary}`
              : `${hero.primary} ${hero.primaryUnit}`;
            const isLast = index === topRows.length - 1;

            return (
              <View key={row.key} style={{ borderBottomWidth: !isLast || expanded ? 0.5 : 0, borderBottomColor: colors.border }}>
                <Pressable
                  onPress={() => setExpandedKey(expanded ? null : row.key)}
                  className="flex-row items-center gap-2.5 px-3 py-2.5"
                  style={{ backgroundColor: rank === 1 ? "rgba(255,214,10,0.04)" : "transparent" }}
                >
                  <RankBadge rank={rank} />
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-baseline justify-between gap-2">
                      <Text
                        className="min-w-0 flex-1 text-[13px] font-semibold"
                        numberOfLines={1}
                        style={{ color: colors.textPrimary }}
                      >
                        {row.displayName}
                      </Text>
                      <Text
                        className="text-sm font-extrabold tabular-nums"
                        style={{ color: rank === 1 ? PR_GOLD : colors.textPrimary }}
                      >
                        {statLabel}
                      </Text>
                    </View>
                    <Text className="mt-0.5 text-[10px] font-medium" style={{ color: colors.textTertiary }}>
                      {formatPersonalRecordDate(row.bestDateKey, row.bestEndedAtMs)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textTertiary, fontSize: 16 }}>{expanded ? "⌄" : "›"}</Text>
                </Pressable>
                {expanded ? (
                  <View className="gap-1 px-3 pb-2.5" style={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
                    {row.history.map((entry) => (
                      <HistoryRow
                        key={entry.endedAtMs}
                        entry={entry}
                        unit={wUnit}
                        isCurrentBest={entry.endedAtMs === row.bestEndedAtMs}
                        colors={colors}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
    </View>
  );
}

function PlaceholderRow({
  rank,
  label,
  isLast,
  borderColor,
  textTertiary,
}: {
  rank: number;
  label: string;
  isLast: boolean;
  borderColor: string;
  textTertiary: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2.5 px-3 py-2.5"
      style={{
        borderBottomWidth: !isLast ? 0.5 : 0,
        borderBottomColor: borderColor,
        backgroundColor: rank === 1 ? "rgba(255,214,10,0.04)" : "transparent",
        opacity: 0.55,
      }}
    >
      <RankBadge rank={rank} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text className="text-[13px] font-semibold" style={{ color: textTertiary }}>
            {label}
          </Text>
          <Text className="text-sm font-bold" style={{ color: textTertiary }}>
            —
          </Text>
        </View>
        <Text className="mt-0.5 text-[10px] font-medium" style={{ color: textTertiary }}>
          Log sets in Workout
        </Text>
      </View>
    </View>
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
    <View
      className="h-[26px] w-[26px] items-center justify-center rounded-full"
      style={{ borderWidth: 1.5, borderColor: palette.ring, backgroundColor: palette.bg }}
    >
      <Text className="text-xs font-extrabold tabular-nums" style={{ color: palette.text }}>
        {rank}
      </Text>
    </View>
  );
}

function HistoryRow({
  entry,
  unit,
  isCurrentBest,
  colors,
}: {
  entry: PersonalRecordHistoryEntry;
  unit: WeightUnit;
  isCurrentBest: boolean;
  colors: { border: string; backgroundSecondary: string; textPrimary: string; textTertiary: string; accent: string };
}) {
  const highlight = isCurrentBest || entry.isPr;
  return (
    <View
      className="flex-row items-center justify-between gap-2 rounded-lg border px-2 py-1.5"
      style={{
        borderColor: highlight ? colors.border : colors.border,
        backgroundColor: highlight ? colors.backgroundSecondary : colors.backgroundSecondary,
      }}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-xs font-bold tabular-nums" style={{ color: colors.textPrimary }}>
          {formatPersonalRecordSet(entry.bestWeight, entry.bestReps, unit)}
        </Text>
        <Text className="mt-px text-[10px]" style={{ color: colors.textTertiary }}>
          {formatPersonalRecordDate(entry.dayKey, entry.endedAtMs)}
        </Text>
      </View>
      {isCurrentBest ? (
        <Text className="text-[9px] font-bold uppercase tracking-wide" style={{ color: PR_GOLD }}>
          Best
        </Text>
      ) : entry.isPr ? (
        <Text className="text-[9px] font-bold uppercase tracking-wide" style={{ color: colors.accent }}>
          PR
        </Text>
      ) : null}
    </View>
  );
}
