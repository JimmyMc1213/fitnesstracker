import {
  formatVolumeFromOz,
  formatWaterVolume,
  formatWaterVolumeAlt,
  parseVolumeToOz,
  totalWaterOzForDateKey,
  waterQuickAddPresets,
} from "@newyouai/core";
import type { VolumeUnit, WaterLogEntry } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

const WATER_ACCENT = "rgba(10,132,255,0.85)";
const WATER_ACCENT_SOFT = "rgba(10,132,255,0.12)";

type Props = {
  dateKey: string;
  targetOz: number;
  entries: WaterLogEntry[];
  readOnly?: boolean;
  isToday?: boolean;
  volumeUnit: VolumeUnit;
  onAddOz: (oz: number) => void;
  onRemoveEntry?: (entryId: string) => void;
};

function formatLoggedTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function WaterTrackerCard({
  dateKey,
  targetOz,
  entries,
  readOnly = false,
  isToday = true,
  volumeUnit,
  onAddOz,
  onRemoveEntry,
}: Props) {
  const { colors } = useAppTheme();
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [showEarlier, setShowEarlier] = useState(false);
  const [pendingRemoveEntryId, setPendingRemoveEntryId] = useState<string | null>(null);

  const total = totalWaterOzForDateKey({ [dateKey]: entries }, dateKey);
  const pct = targetOz > 0 ? Math.max(0, Math.min(1, total / targetOz)) : 0;
  const sectionLabel = isToday ? "Hydration · Today" : "Hydration";

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.loggedAtMs - a.loggedAtMs),
    [entries],
  );
  const earlierCount = Math.max(0, sortedEntries.length - 1);
  const earlierEntries = sortedEntries.slice(1);
  const quickAddPresets = waterQuickAddPresets(volumeUnit);

  useEffect(() => {
    if (sortedEntries.length <= 1) setShowEarlier(false);
  }, [sortedEntries.length]);

  const parsedCustomAmount = volumeUnit === "L" ? parseFloat(customAmount) : parseInt(customAmount, 10);
  const parsedCustomOz =
    volumeUnit === "L" ? parseVolumeToOz(parsedCustomAmount, "L") : parsedCustomAmount;
  const isCustomValid =
    customAmount !== "" &&
    Number.isFinite(parsedCustomAmount) &&
    parsedCustomOz > 0 &&
    parsedCustomOz <= 128;

  function handleCustomAdd() {
    const amount = volumeUnit === "L" ? parseFloat(customAmount) : parseInt(customAmount, 10);
    const oz = volumeUnit === "L" ? parseVolumeToOz(amount, "L") : amount;
    if (!Number.isFinite(oz) || oz <= 0 || oz > 128) {
      setCustomError(volumeUnit === "L" ? "Enter 0.1-3.8 L" : "Enter 1-128 oz");
      return;
    }
    onAddOz(Math.round(oz));
    setCustomAmount("");
    setCustomError(null);
  }

  function renderEntryRow(entry: WaterLogEntry, showDivider: boolean) {
    const displayAmount = formatWaterVolume(entry.amountOz, volumeUnit);
    return (
      <View
        key={entry.id}
        className="flex-row items-center justify-between gap-2.5"
        style={{ paddingBottom: showDivider ? 8 : 0, borderBottomWidth: showDivider ? 1 : 0, borderBottomColor: colors.border }}
      >
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
            +{displayAmount}
          </Text>
          <Text className="mt-0.5 text-[11px] font-medium" style={{ color: colors.textTertiary }}>
            {formatLoggedTime(entry.loggedAtMs)}
          </Text>
        </View>
        {!readOnly && onRemoveEntry ? (
          <Pressable
            testID={`water-entry-remove-${entry.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${displayAmount}`}
            onPress={() => setPendingRemoveEntryId(entry.id)}
            className="rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: "rgba(255,80,80,0.12)" }}
          >
            <Text className="text-xs font-semibold" style={{ color: "rgba(255,120,120,0.95)" }}>
              Remove
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const pendingEntry = pendingRemoveEntryId
    ? entries.find((entry) => entry.id === pendingRemoveEntryId)
    : null;

  return (
    <View
      testID="water-tracker"
      className="mt-[18px] rounded-[14px] border p-[18px]"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="mb-3.5 flex-row items-center gap-2.5">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: WATER_ACCENT_SOFT }}
        >
          <Text className="text-base" style={{ color: WATER_ACCENT }}>
            💧
          </Text>
        </View>
        <Text
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          {sectionLabel}
        </Text>
      </View>

      <View className="gap-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-[11px] font-normal" style={{ color: colors.textTertiary }}>
            Water
          </Text>
          <View className="items-end">
            <Text className="text-xs font-semibold tabular-nums" style={{ color: colors.textPrimary }}>
              {formatVolumeFromOz(total, volumeUnit)}
              <Text style={{ color: colors.textTertiary, fontWeight: "400" }}>
                {" "}
                / {formatWaterVolume(targetOz, volumeUnit)}
              </Text>
            </Text>
            <Text className="mt-0.5 text-[11px] font-medium" style={{ color: colors.textTertiary }}>
              {formatWaterVolumeAlt(total, volumeUnit)} · target {formatWaterVolume(targetOz, volumeUnit)}
            </Text>
          </View>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
          <View className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: WATER_ACCENT }} />
        </View>
      </View>

      {sortedEntries.length > 0 ? (
        <View className="mt-3.5 gap-2">
          {renderEntryRow(sortedEntries[0], earlierCount > 0)}
          {showEarlier
            ? earlierEntries.map((entry, idx) =>
                renderEntryRow(entry, idx < earlierEntries.length - 1),
              )
            : null}
          {earlierCount > 0 ? (
            <Pressable
              testID="water-show-earlier"
              onPress={() => setShowEarlier((open) => !open)}
              accessibilityRole="button"
              className="mt-0.5"
            >
              <Text className="text-xs font-semibold" style={{ color: WATER_ACCENT }}>
                {showEarlier
                  ? "Hide earlier entries"
                  : `Show ${earlierCount} earlier ${earlierCount === 1 ? "entry" : "entries"}`}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!readOnly ? (
        <>
          <View className="mt-3.5 flex-row flex-wrap gap-2">
            {quickAddPresets.map((preset) => {
              const oz = volumeUnit === "L" ? Math.round(parseVolumeToOz(preset, "L")) : preset;
              const label = volumeUnit === "L" ? `+${preset} L` : `+${preset} oz`;
              return (
                <Pressable
                  key={preset}
                  testID={`water-quick-add-${oz}`}
                  onPress={() => onAddOz(oz)}
                  accessibilityRole="button"
                  className="rounded-[10px] border px-3.5 py-2.5"
                  style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
                >
                  <Text className="text-[13px] font-semibold tabular-nums" style={{ color: colors.textSecondary }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-2.5 flex-row items-stretch gap-2">
            <TextInput
              value={customAmount}
              onChangeText={(raw) => {
                setCustomAmount(raw);
                if (customError) setCustomError(null);
              }}
              testID="water-custom-amount"
              accessibilityLabel={volumeUnit === "L" ? "Custom water amount in liters" : "Custom water amount in ounces"}
              placeholder={volumeUnit === "L" ? "Custom L" : "Custom oz"}
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              className="min-w-0 flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] tabular-nums"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
              }}
            />
            <Pressable
              testID="water-custom-add"
              onPress={handleCustomAdd}
              disabled={!isCustomValid}
              accessibilityRole="button"
              accessibilityLabel="Add custom water amount"
              className="items-center justify-center rounded-[10px] px-4 py-2.5"
              style={{
                backgroundColor: isCustomValid ? "rgba(10,132,255,0.22)" : colors.border,
                opacity: isCustomValid ? 1 : 0.5,
              }}
            >
              <Text className="text-[13px] font-bold" style={{ color: "#0A84FF" }}>
                Add
              </Text>
            </Pressable>
          </View>
          {customError ? (
            <Text className="mt-1.5 text-[11px] font-medium" style={{ color: "rgba(255,120,120,0.85)" }}>
              {customError}
            </Text>
          ) : null}
        </>
      ) : null}

      {pendingRemoveEntryId && onRemoveEntry && pendingEntry ? (
        <WorkoutConfirmSheet
          title="Remove water entry?"
          message={`Remove ${formatWaterVolume(pendingEntry.amountOz, volumeUnit)} from today's log?`}
          cancelLabel="Keep entry"
          confirmLabel="Remove entry"
          confirmDestructive
          sheetTestID="water-remove-confirm"
          cancelTestID="water-remove-cancel"
          confirmTestID="water-remove-confirm-action"
          onCancel={() => setPendingRemoveEntryId(null)}
          onConfirm={() => {
            onRemoveEntry(pendingRemoveEntryId);
            setPendingRemoveEntryId(null);
          }}
        />
      ) : null}
    </View>
  );
}
