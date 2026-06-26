import {
  SUNDAY_CHECK_IN_STEPS,
  type SundayCheckInCommitmentOption,
  type SundayCheckInData,
  type SundayCheckInMetric,
} from "@newyouai/core";
import type { UnitPreferences, WeekFocusCommitment } from "@newyouai/types";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomActionBar } from "@/components/BottomActionBar";
import { AppTextField } from "@/components/ui/AppTextField";
import { CHART_PAD_LEFT, CHART_PAD_RIGHT, WeightLineChart } from "@/components/progress/WeightLineChart";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { formatWeightFromLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  data: SundayCheckInData;
  unitPreferences: UnitPreferences;
  onClose: () => void;
  onComplete: (commitments: WeekFocusCommitment[]) => void;
};

const SUCCESS_GREEN = "#22c55e";
const WARNING_AMBER = "#fbbf24";
const DANGER_RED = "#ef4444";

function metricToneColor(tone: SundayCheckInMetric["tone"], colors: ReturnType<typeof useAppTheme>["colors"]): string {
  switch (tone) {
    case "success":
      return SUCCESS_GREEN;
    case "warning":
      return WARNING_AMBER;
    case "danger":
      return DANGER_RED;
    case "accent":
      return colors.accent;
    default:
      return colors.textTertiary;
  }
}

export function SundayWeeklyCheckInFlow({ data, unitPreferences, onClose, onComplete }: Props) {
  const { colors } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customCommitments, setCustomCommitments] = useState<SundayCheckInCommitmentOption[]>([]);
  const [lockedIn, setLockedIn] = useState(false);
  const [chartW, setChartW] = useState(0);

  const commitmentOptions = useMemo(
    () => [...data.commitmentOptions, ...customCommitments],
    [data.commitmentOptions, customCommitments],
  );

  useEffect(() => {
    setStep(0);
    setSelectedIds(new Set());
    setCustomCommitments([]);
    setLockedIn(false);
  }, [data.sundayKey]);

  function requestClose() {
    if (step > 0 && !lockedIn) {
      Alert.alert("Leave check-in?", "Your progress in this flow will be lost.", [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: onClose },
      ]);
      return;
    }
    onClose();
  }

  function goForward() {
    if (step >= SUNDAY_CHECK_IN_STEPS - 1) return;
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step <= 0) {
      requestClose();
      return;
    }
    setStep((s) => s - 1);
  }

  function toggleCommitment(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= 3) return prev;
      next.add(id);
      return next;
    });
  }

  function addCustomCommitment(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const option: SundayCheckInCommitmentOption = {
      id: `custom-${Date.now()}`,
      title: trimmed,
      subtitle: "",
    };
    setCustomCommitments((prev) => [...prev, option]);
    setSelectedIds((prev) => {
      if (prev.size >= 3) return prev;
      const next = new Set(prev);
      next.add(option.id);
      return next;
    });
  }

  function handleLockIn() {
    if (selectedIds.size === 0) return;
    setLockedIn(true);
  }

  function handleDone() {
    const commitments: WeekFocusCommitment[] = commitmentOptions
      .filter((o) => selectedIds.has(o.id))
      .map((o) => ({ id: o.id, title: o.title, subtitle: o.subtitle }));
    onComplete(commitments);
  }

  function handleContinue() {
    if (step === 3) {
      if (lockedIn) handleDone();
      else handleLockIn();
      return;
    }
    goForward();
  }

  const continueLabel =
    step === 3
      ? lockedIn
        ? "Done"
        : `Lock in & start week ${data.nextWeekNumber}`
      : "Continue";

  const wUnit = unitPreferences.weightUnit;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }} testID="modal-sunday-check-in">
      <FlowHeader step={step} onBack={goBack} onClose={requestClose} showBack={step > 0} colors={colors} />

      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingBottom: 16 }}
        testID={`sunday-check-in-step-${step}`}
      >
        {step === 0 ? <StepOverview data={data} colors={colors} /> : null}
        {step === 1 ? (
          <StepBodyWeight
            data={data}
            wUnit={wUnit}
            colors={colors}
            chartW={chartW || Math.min(360, windowWidth - 72)}
            onChartLayout={(w) => setChartW(w)}
          />
        ) : null}
        {step === 2 ? <StepCoachRead data={data} colors={colors} /> : null}
        {step === 3 ? (
          <StepCommitments
            data={data}
            options={commitmentOptions}
            selectedIds={selectedIds}
            lockedIn={lockedIn}
            displayName={data.displayName}
            onToggle={toggleCommitment}
            onAddCustom={addCustomCommitment}
            colors={colors}
          />
        ) : null}
      </ScrollView>

      <BottomActionBar>
        <PrimaryButton
          block
          testID="sunday-check-in-continue"
          disabled={step === 3 && !lockedIn && selectedIds.size === 0}
          onPress={handleContinue}
        >
          {continueLabel}
        </PrimaryButton>
        {step === 3 && !lockedIn ? (
          <Pressable
            onPress={() => onComplete([])}
            className="mt-2.5 items-center py-2.5"
            testID="sunday-check-in-skip"
          >
            <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
              Skip for now
            </Text>
          </Pressable>
        ) : null}
      </BottomActionBar>
    </View>
  );
}

function FlowHeader({
  step,
  onBack,
  onClose,
  showBack,
  colors,
}: {
  step: number;
  onBack: () => void;
  onClose: () => void;
  showBack: boolean;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="relative px-screen-x pb-3">
      {!showBack ? (
        <Pressable
          onPress={onClose}
          testID="modal-close"
          accessibilityLabel="Close check-in"
          className="absolute right-0 z-10 h-9 w-9 items-center justify-center rounded-full border"
          style={{
            top: insets.top + 6,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text style={{ color: colors.textSecondary }}>✕</Text>
        </Pressable>
      ) : null}
      <View className="mb-3.5 flex-row items-center justify-between" style={{ paddingTop: insets.top + 6 }}>
        {showBack ? (
          <Pressable
            onPress={onBack}
            testID="sunday-check-in-back"
            accessibilityLabel="Back"
            className="h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.textSecondary }}>‹</Text>
          </Pressable>
        ) : (
          <View className="h-9 w-9" />
        )}
        <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
          Sunday check-in
        </Text>
        <Text className="min-w-[36px] text-right text-xs font-semibold tabular-nums" style={{ color: colors.textTertiary }}>
          {step + 1}/{SUNDAY_CHECK_IN_STEPS}
        </Text>
      </View>
      <View className="flex-row gap-1.5">
        {Array.from({ length: SUNDAY_CHECK_IN_STEPS }, (_, i) => (
          <View
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              backgroundColor: i <= step ? colors.accent : colors.border,
              opacity: i <= step ? 1 : 0.65,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function StepOverview({
  data,
  colors,
}: {
  data: SundayCheckInData;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <>
      <Eyebrow colors={colors}>{data.rangeLabelCaps}</Eyebrow>
      <FlowTitle colors={colors}>{data.headline}</FlowTitle>
      <FlowSubtitle colors={colors}>{data.summaryLine}</FlowSubtitle>
      {data.multiWeekLines.length > 0 ? (
        <View className="mt-3 gap-1.5">
          {data.multiWeekLines.map((line) => (
            <Text key={line} className="text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}
      <StatusPill label={data.statusLabel} positive={data.onTrack} />
      <View className="mt-4 flex-row flex-wrap gap-2.5">
        {data.metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} colors={colors} />
        ))}
      </View>
      {!data.hasFullRecap ? (
        <Text className="mt-3 text-xs font-medium leading-[1.45]" style={{ color: colors.textTertiary }}>
          Log your weight a few times next week for a full weight recap.
        </Text>
      ) : null}
    </>
  );
}

function StepBodyWeight({
  data,
  wUnit,
  colors,
  chartW,
  onChartLayout,
}: {
  data: SundayCheckInData;
  wUnit: UnitPreferences["weightUnit"];
  colors: ReturnType<typeof useAppTheme>["colors"];
  chartW: number;
  onChartLayout: (w: number) => void;
}) {
  const chartValues = data.dailyWeights.map((d) => d.weightLbs).filter((v): v is number => v != null);
  const startLabel =
    data.weightStartLbs != null
      ? `${formatWeightFromLbs(data.weightStartLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "-";
  const endLabel =
    data.weightEndLbs != null
      ? `${formatWeightFromLbs(data.weightEndLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "-";

  return (
    <>
      <Eyebrow colors={colors}>Body weight</Eyebrow>
      <FlowTitle colors={colors}>{data.weightHeadline}</FlowTitle>
      <View
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="mb-3 flex-row items-center justify-between gap-2">
          <WeightEndpoint label="Start of week" value={startLabel} colors={colors} />
          <Text style={{ color: colors.textTertiary }}>›</Text>
          <WeightEndpoint label="Today" value={endLabel} accent colors={colors} />
        </View>
        <View className="w-full" onLayout={(e) => onChartLayout(Math.max(1, Math.round(e.nativeEvent.layout.width)))}>
          {chartValues.length >= 2 && chartW > 0 ? (
            <WeightLineChart
              data={chartValues}
              width={chartW}
              height={140}
              stroke={colors.accent}
              gridColor={colors.border}
              fillColor={`${colors.accent}22`}
              tickColor={colors.textTertiary}
              padLeft={CHART_PAD_LEFT}
              padRight={CHART_PAD_RIGHT}
            />
          ) : (
            <View className="h-[120px] items-center justify-center">
              <Text className="text-[13px] font-medium" style={{ color: colors.textTertiary }}>
                Log more weigh-ins to see the trend
              </Text>
            </View>
          )}
        </View>
        <View className="mt-3.5 flex-row flex-wrap gap-2">
          {data.weightDeltaLbs != null ? (
            <StatPill
              label={`${data.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(data.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`}
              tone="success"
              colors={colors}
            />
          ) : null}
          {data.weightWeeklyAvgDelta != null ? (
            <StatPill
              label={`${Math.abs(data.weightWeeklyAvgDelta).toFixed(1)} ${weightUnitLabel(wUnit)} / week avg`}
              tone="neutral"
              colors={colors}
            />
          ) : null}
          <StatPill label={`goal pace: ${data.goalPaceLabel}`} tone="neutral" colors={colors} />
        </View>
      </View>
      <CoachNoteCard insight={data.weightInsight} colors={colors} />
    </>
  );
}

function StepCoachRead({
  data,
  colors,
}: {
  data: SundayCheckInData;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <>
      <Eyebrow colors={colors}>Coach read</Eyebrow>
      <FlowTitle colors={colors}>Here's what stood out.</FlowTitle>
      <CoachSection title="Wins" tone="success" colors={colors}>
        {data.wins.map((item) => (
          <CoachBullet key={item.text} text={item.text} tone="success" colors={colors} />
        ))}
      </CoachSection>
      {data.watchItems.length > 0 ? (
        <CoachSection title="Worth watching" tone="danger" colors={colors}>
          {data.watchItems.map((item) => (
            <CoachBullet key={item.text} text={item.text} tone="danger" colors={colors} />
          ))}
        </CoachSection>
      ) : null}
      <View
        className="mt-3.5 rounded-xl border p-3.5"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="mb-2.5 flex-row items-center justify-between">
          <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
            Fuel update
          </Text>
          <Text
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={{ borderColor: colors.border, color: colors.textSecondary }}
          >
            no change
          </Text>
        </View>
        <Text className="text-[13px] font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
          {data.fuelUpdate.summary}
        </Text>
      </View>
    </>
  );
}

function StepCommitments({
  data,
  options,
  selectedIds,
  lockedIn,
  displayName,
  onToggle,
  onAddCustom,
  colors,
}: {
  data: SundayCheckInData;
  options: SundayCheckInCommitmentOption[];
  selectedIds: Set<string>;
  lockedIn: boolean;
  displayName: string;
  onToggle: (id: string) => void;
  onAddCustom: (title: string) => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const atSelectionLimit = selectedIds.size >= 3;

  function submitCustom() {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setCustomDraft("");
    setCreatingCustom(false);
  }

  return (
    <>
      <Eyebrow colors={colors}>Week {data.nextWeekNumber} focus</Eyebrow>
      <FlowTitle colors={colors}>Pick 1–3 commitments.</FlowTitle>
      <FlowSubtitle colors={colors}>These pin to your Home as habits for week {data.nextWeekNumber}.</FlowSubtitle>
      <View className="mt-4 gap-2.5">
        {options.map((option) => (
          <CommitmentOptionRow
            key={option.id}
            option={option}
            selected={selectedIds.has(option.id)}
            lockedIn={lockedIn}
            onToggle={() => onToggle(option.id)}
            colors={colors}
          />
        ))}
        {!lockedIn ? (
          creatingCustom ? (
            <View className="rounded-xl border p-3.5" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
                Custom commitment
              </Text>
              <AppTextField
                value={customDraft}
                onChangeText={setCustomDraft}
                placeholder="e.g. No phone after 9pm"
                maxLength={80}
                autoFocus
                testID="sunday-check-in-custom-input"
                size="compact"
                onSubmitEditing={submitCustom}
              />
              {atSelectionLimit ? (
                <Text className="mt-2 text-xs font-medium" style={{ color: colors.textTertiary }}>
                  Deselect one commitment to add this to your week.
                </Text>
              ) : null}
              <View className="mt-3 flex-row gap-2">
                <PrimaryButton
                  block
                  disabled={!customDraft.trim()}
                  testID="sunday-check-in-custom-add"
                  onPress={submitCustom}
                >
                  Add commitment
                </PrimaryButton>
                <Pressable
                  onPress={() => {
                    setCreatingCustom(false);
                    setCustomDraft("");
                  }}
                  className="items-center justify-center rounded-xl border px-3.5 py-3"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setCreatingCustom(true)}
              testID="sunday-check-in-custom-create"
              className="rounded-xl border border-dashed px-3.5 py-3.5"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                + Create custom commitment
              </Text>
            </Pressable>
          )
        ) : null}
      </View>
      {lockedIn ? (
        <View
          testID="sunday-check-in-locked"
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: `${colors.accent}33`, backgroundColor: colors.card }}
        >
          <Text className="text-[15px] font-bold" style={{ color: colors.textPrimary }}>
            Week {data.nextWeekNumber} is live.
          </Text>
          <Text className="mt-1 text-xs font-medium" style={{ color: colors.textSecondary }}>
            {selectedIds.size} commitment{selectedIds.size === 1 ? "" : "s"} pinned
            {displayName.trim() ? `. See you tomorrow, ${displayName.trim()}.` : "."}
          </Text>
        </View>
      ) : null}
    </>
  );
}

function Eyebrow({ children, colors }: { children: ReactNode; colors: ReturnType<typeof useAppTheme>["colors"] }) {
  return (
    <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textTertiary }}>
      {children}
    </Text>
  );
}

function FlowTitle({ children, colors }: { children: ReactNode; colors: ReturnType<typeof useAppTheme>["colors"] }) {
  return (
    <Text className="text-[26px] font-bold leading-tight tracking-tight" style={{ color: colors.textPrimary }}>
      {children}
    </Text>
  );
}

function FlowSubtitle({ children, colors }: { children: ReactNode; colors: ReturnType<typeof useAppTheme>["colors"] }) {
  return (
    <Text className="mt-2.5 text-sm font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
      {children}
    </Text>
  );
}

function StatusPill({ label, positive }: { label: string; positive: boolean }) {
  const color = positive ? SUCCESS_GREEN : DANGER_RED;
  return (
    <View
      className="mt-3.5 flex-row items-center gap-2 self-start rounded-full border px-3 py-2"
      style={{
        borderColor: positive ? "rgba(34, 197, 94, 0.22)" : "rgba(239, 68, 68, 0.22)",
        backgroundColor: positive ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
      }}
    >
      <View className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function MetricTile({
  metric,
  colors,
}: {
  metric: SundayCheckInMetric;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const statusColor = metricToneColor(metric.tone, colors);
  return (
    <View
      className="min-w-[46%] flex-1 rounded-xl border p-3"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text className="text-[9px] font-bold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
        {metric.label}
      </Text>
      <Text className="mt-2 text-xl font-extrabold tabular-nums" style={{ color: colors.textPrimary }}>
        {metric.value}
      </Text>
      <Text className="mt-1 text-[11px] font-semibold" style={{ color: statusColor }}>
        {metric.status}
      </Text>
    </View>
  );
}

function WeightEndpoint({
  label,
  value,
  accent,
  colors,
}: {
  label: string;
  value: string;
  accent?: boolean;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-[9px] font-bold uppercase tracking-wide" style={{ color: colors.textTertiary }}>
        {label}
      </Text>
      <Text
        className="mt-1 text-base font-extrabold tabular-nums"
        style={{ color: accent ? colors.accent : colors.textPrimary }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatPill({
  label,
  tone,
  colors,
}: {
  label: string;
  tone: "success" | "neutral";
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const dot = tone === "success" ? SUCCESS_GREEN : colors.textTertiary;
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
      <Text className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

function CoachNoteCard({
  insight,
  colors,
}: {
  insight: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View
      className="mt-3.5 rounded-xl border p-3.5"
      style={{ borderColor: `${colors.accent}33`, backgroundColor: colors.card }}
    >
      <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
        Coach
      </Text>
      <Text className="mt-3 text-[13px] font-medium leading-[1.5]" style={{ color: colors.textSecondary }}>
        {insight}
      </Text>
    </View>
  );
}

function coachToneColor(tone: "success" | "warning" | "danger"): string {
  if (tone === "success") return SUCCESS_GREEN;
  if (tone === "danger") return DANGER_RED;
  return WARNING_AMBER;
}

function CoachSection({
  title,
  tone,
  children,
  colors,
}: {
  title: string;
  tone: "success" | "warning" | "danger";
  children: ReactNode;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2.5 text-sm font-bold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

function CoachBullet({
  text,
  tone,
  colors,
}: {
  text: string;
  tone: "success" | "warning" | "danger";
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const dot = coachToneColor(tone);
  return (
    <View
      className="flex-row items-start gap-2.5 rounded-xl border p-3"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="mt-1.5 h-[7px] w-[7px] rounded-full" style={{ backgroundColor: dot }} />
      <Text className="flex-1 text-[13px] font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
        {text}
      </Text>
    </View>
  );
}

function CommitmentOptionRow({
  option,
  selected,
  lockedIn,
  onToggle,
  colors,
}: {
  option: SundayCheckInCommitmentOption;
  selected: boolean;
  lockedIn: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={lockedIn}
      testID={`sunday-commitment-${option.id}`}
      className="rounded-xl border p-3.5"
      style={{
        borderColor: selected ? `${colors.accent}73` : colors.border,
        backgroundColor: selected ? `${colors.accent}14` : colors.card,
        opacity: lockedIn && !selected ? 0.55 : 1,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full"
          style={{
            borderWidth: selected ? 0 : 1,
            borderColor: colors.border,
            backgroundColor: selected ? colors.accent : "transparent",
          }}
        >
          {selected ? (
            <Text className="text-[10px] font-bold" style={{ color: colors.accentText }}>
              ✓
            </Text>
          ) : null}
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {option.title}
          </Text>
          {option.subtitle ? (
            <Text className="mt-1 text-xs font-medium leading-[1.45]" style={{ color: colors.textSecondary }}>
              {option.subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
