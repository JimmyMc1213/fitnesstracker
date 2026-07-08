import { coalesceSundayCheckInRecord } from "@newyouai/core";
import type { SundayCheckInWeekRecord, UnitPreferences } from "@newyouai/types";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import type { TablerIcon } from "@/lib/tablerIcon";

import { BottomSheet } from "@/components/motion";

import { useBottomActionPadding } from "@/lib/screenInsets";
import { ProgressSectionLabel } from "@/components/progress/ProgressSectionLabel";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";
import { COACH_BLUE_LABEL, coachCardColors } from "@/lib/workoutUiTokens";

const SUCCESS_GREEN = "#22c55e";
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function sortCheckInHistory(history: SundayCheckInWeekRecord[]): SundayCheckInWeekRecord[] {
  return history
    .map(coalesceSundayCheckInRecord)
    .sort((a, b) => b.weekStartKey.localeCompare(a.weekStartKey));
}

function formatWeekRange(weekStartKey: string): string {
  const start = new Date(`${weekStartKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startFmt} – ${endFmt}`;
}

type ListProps = {
  history: SundayCheckInWeekRecord[];
  unitPreferences: UnitPreferences;
  maxRows?: number;
};

export function SundayCheckInHistoryList({ history, unitPreferences, maxRows }: ListProps) {
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState<SundayCheckInWeekRecord | null>(null);
  const sorted = useMemo(() => sortCheckInHistory(history), [history]);
  const visible = maxRows != null ? sorted.slice(0, maxRows) : sorted;

  if (visible.length === 0) return null;

  return (
    <>
      <View
        className="overflow-hidden rounded-[14px] border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {visible.map((record, i) => (
          <RecapListRow
            key={record.weekStartKey}
            record={record}
            unitPreferences={unitPreferences}
            showDivider={i < visible.length - 1}
            onOpen={() => setSelected(record)}
          />
        ))}
      </View>

      <RecapDetailSheet
        record={selected}
        unitPreferences={unitPreferences}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

type SectionProps = {
  history: SundayCheckInWeekRecord[];
  unitPreferences: UnitPreferences;
  onShowPrevious?: () => void;
};

export function SundayCheckInHistorySection({ history, unitPreferences, onShowPrevious }: SectionProps) {
  const { colors } = useAppTheme();
  const sorted = useMemo(() => sortCheckInHistory(history), [history]);

  if (sorted.length === 0) return null;

  const hasPrevious = sorted.length > 1;

  return (
    <View testID="progress-sunday-history">
      <ProgressSectionLabel>Weekly check-ins</ProgressSectionLabel>
      <SundayCheckInHistoryList history={history} unitPreferences={unitPreferences} maxRows={1} />
      {hasPrevious && onShowPrevious ? (
        <Pressable
          testID="progress-sunday-history-show-previous"
          onPress={onShowPrevious}
          className="mt-2.5"
          accessibilityRole="button"
        >
          <Text className="text-[13px] font-semibold" style={{ color: FUTURE_YOU_GOLD }}>
            Show previous weeks
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function RecapListRow({
  record,
  unitPreferences,
  showDivider,
  onOpen,
}: {
  record: SundayCheckInWeekRecord;
  unitPreferences: UnitPreferences;
  showDivider: boolean;
  onOpen: () => void;
}) {
  const { colors } = useAppTheme();
  const wUnit = unitPreferences.weightUnit;
  const range = formatWeekRange(record.weekStartKey);
  const weightText =
    record.weightDeltaLbs != null
      ? `${record.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(record.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : null;

  return (
    <Pressable
      testID={`sunday-history-row-${record.weekStartKey}`}
      onPress={onOpen}
      className="px-4 py-3.5"
      style={{
        borderBottomWidth: showDivider ? 0.5 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View className="flex-row items-start justify-between gap-2.5">
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
            Week {record.weekNumber} · {range}
          </Text>
          <Text
            className="mt-1 text-sm font-bold leading-tight tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            {record.headline || `Week ${record.weekNumber} recap`}
          </Text>
          <Text className="mt-1.5 text-xs font-medium leading-[1.4]" style={{ color: colors.textSecondary }}>
            {record.workoutsCompleted}/{record.workoutsPlanned} workouts · {record.proteinDaysHit}/7 protein
            {weightText ? ` · ${weightText}` : ""}
          </Text>
        </View>
        <View className="shrink-0 flex-row items-center gap-2">
          {record.onTrack ? (
            <Text
              className="rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide"
              style={{ color: "#fff", backgroundColor: SUCCESS_GREEN }}
            >
              On track
            </Text>
          ) : null}
          <Text style={{ color: colors.textTertiary }}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RecapDetailSheet({
  record,
  unitPreferences,
  onClose,
}: {
  record: SundayCheckInWeekRecord | null;
  unitPreferences: UnitPreferences;
  onClose: () => void;
}) {
  const { colors, theme } = useAppTheme();
  const coachCard = coachCardColors(theme);
  const bottomActionPadding = useBottomActionPadding();
  const safe = record ? coalesceSundayCheckInRecord(record) : null;
  const wUnit = unitPreferences.weightUnit;

  return (
    <BottomSheet
      open={safe != null}
      onClose={onClose}
      panelStyle={{ paddingHorizontal: 0, paddingBottom: bottomActionPadding, maxHeight: "85%" }}
    >
      <View testID="sunday-history-recap-sheet" className="max-h-[85%] rounded-t-2xl px-4 pt-4">
          {safe ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4 flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
                    Week {safe.weekNumber} · {formatWeekRange(safe.weekStartKey)}
                  </Text>
                  <Text className="mt-2 text-xl font-bold leading-tight tracking-tight" style={{ color: colors.textPrimary }}>
                    {safe.headline || `Week ${safe.weekNumber} recap`}
                  </Text>
                </View>
                <Pressable
                  testID="sunday-history-recap-close"
                  onPress={onClose}
                  accessibilityLabel="Close recap"
                  className="h-8 w-8 items-center justify-center rounded-full border"
                  style={{ borderColor: colors.border }}
                >
                  <Text style={{ color: colors.textSecondary }}>✕</Text>
                </Pressable>
              </View>

              {safe.summary ? (
                <Text className="mb-3.5 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
                  {safe.summary}
                </Text>
              ) : null}

              <StatGrid record={safe} unitPreferences={unitPreferences} />

              {safe.dayFlags.length === 7 ? (
                <View className="mt-3.5 flex-row justify-between gap-0.5">
                  {safe.dayFlags.split("").map((flag, i) => (
                    <MiniDayCell key={`${safe.weekStartKey}-${i}`} flag={flag} label={DAY_LABELS[i] ?? ""} />
                  ))}
                </View>
              ) : null}

              {safe.weightInsight ? (
                <View
                  className="mt-3.5 rounded-xl border p-3"
                  style={{ borderColor: coachCard.border, backgroundColor: coachCard.background }}
                >
                  <Text className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: COACH_BLUE_LABEL }}>
                    Coach
                  </Text>
                  <Text className="text-[13px] font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
                    {safe.weightInsight}
                  </Text>
                </View>
              ) : null}

              {safe.wins.length > 0 ? (
                <RecapBulletSection title="Wins" icon={IconCircleCheck} items={safe.wins} tone="success" />
              ) : null}

              {safe.watch.length > 0 ? (
                <RecapBulletSection title="Worth watching" icon={IconAlertTriangle} items={safe.watch} tone="warning" />
              ) : null}

              {safe.commitments.length > 0 ? (
                <View className="mt-4">
                  <Text className="mb-2 text-[13px] font-bold" style={{ color: colors.textPrimary }}>
                    Week focus
                  </Text>
                  <View className="gap-1.5">
                    {safe.commitments.map((title) => (
                      <View
                        key={title}
                        className="rounded-[10px] border px-3 py-2.5"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
                      >
                        <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                          {title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {safe.weightEndLbs != null ? (
                <Text className="mt-4 text-xs font-medium" style={{ color: colors.textTertiary }}>
                  End weight: {formatWeightFromLbs(safe.weightEndLbs, wUnit)} {weightUnitLabel(wUnit)}
                </Text>
              ) : null}
            </ScrollView>
          ) : null}
      </View>
    </BottomSheet>
  );
}

function StatGrid({ record, unitPreferences }: { record: SundayCheckInWeekRecord; unitPreferences: UnitPreferences }) {
  const { colors } = useAppTheme();
  const wUnit = unitPreferences.weightUnit;
  const weightText =
    record.weightDeltaLbs != null
      ? `${record.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(record.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "-";

  const items = [
    { label: "Workouts", value: `${record.workoutsCompleted}/${record.workoutsPlanned}` },
    { label: "Protein", value: `${record.proteinDaysHit}/7` },
    { label: "Weight Δ", value: weightText },
    { label: "Weigh-ins", value: `${record.weighInsThisWeek}/7` },
  ];

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <View
          key={item.label}
          className="min-w-[46%] flex-1 rounded-[10px] border px-3 py-2.5"
          style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
        >
          <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.textTertiary }}>
            {item.label}
          </Text>
          <Text className="mt-1 text-[15px] font-extrabold tabular-nums" style={{ color: colors.textPrimary }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function RecapBulletSection({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: TablerIcon;
  items: string[];
  tone: "success" | "warning";
}) {
  const { colors } = useAppTheme();
  const dot = tone === "success" ? SUCCESS_GREEN : "#ef4444";

  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Icon size={16} color={dot} strokeWidth={2} />
        <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
          {title}
        </Text>
      </View>
      <View className="gap-1.5">
        {items.map((text) => (
          <View
            key={text}
            className="flex-row items-start gap-2 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
          >
            <View className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
            <Text className="flex-1 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              {text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MiniDayCell({ flag, label }: { flag: string; label: string }) {
  const { colors } = useAppTheme();
  const workout = flag === "w" || flag === "b";
  const protein = flag === "p" || flag === "b";

  return (
    <View className="min-w-0 flex-1 items-center gap-0.5">
      <View
        className="aspect-square w-full max-w-[24px] rounded-md border"
        style={{
          backgroundColor: workout ? FUTURE_YOU_GOLD : colors.backgroundSecondary,
          borderColor: workout ? FUTURE_YOU_GOLD : colors.border,
        }}
      />
      <View
        className="h-0.5 w-[65%] rounded-full"
        style={{ backgroundColor: protein ? SUCCESS_GREEN : "transparent" }}
      />
      <Text className="text-[9px] font-semibold" style={{ color: colors.textTertiary }}>
        {label}
      </Text>
    </View>
  );
}
