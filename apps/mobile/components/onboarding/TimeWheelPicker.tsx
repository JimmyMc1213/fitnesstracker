import { normalizeTimeHHmm } from "@newyouai/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import {
  useWheelPickerColors,
  WheelPickerColumn,
  WheelPickerFrame,
  type WheelPickerAppearance,
} from "@/components/ui/WheelPickerColumn";

type DayPeriod = 0 | 1;

function parseTimeHHmm(value: string): { hour12: number; minute: number; period: DayPeriod } {
  const normalized = normalizeTimeHHmm(value, "07:00");
  const [hourStr, minuteStr] = normalized.split(":");
  const hour24 = Number(hourStr);
  const minute = Number(minuteStr);
  const period: DayPeriod = hour24 >= 12 ? 1 : 0;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, period };
}

function toTimeHHmm(hour12: number, minute: number, period: DayPeriod): string {
  let hour24 = hour12 % 12;
  if (period === 1) hour24 += 12;
  if (period === 0 && hour12 === 12) hour24 = 0;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const PERIODS: DayPeriod[] = [0, 1];
const PERIOD_LABELS = ["AM", "PM"];

export type TimeWheelPickerProps = {
  value: string;
  onChange: (value: string) => void;
  /** When false, wheels scroll but no row is styled as selected until the parent commits. */
  highlightSelection?: boolean;
  appearance?: WheelPickerAppearance;
  /** Background color the wheel edges fade into (match the parent surface). */
  fadeColor?: string;
};

export function TimeWheelPicker({
  value,
  onChange,
  highlightSelection = true,
  appearance = "default",
  fadeColor,
}: TimeWheelPickerProps) {
  const colors = useWheelPickerColors(appearance, fadeColor);
  const parsed = parseTimeHHmm(value);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<DayPeriod>(parsed.period);

  useEffect(() => {
    const next = parseTimeHHmm(value);
    setHour12(next.hour12);
    setMinute(next.minute);
    setPeriod(next.period);
  }, [value]);

  const hourIndex = Math.max(0, HOURS.indexOf(hour12));
  const minuteIndex = Math.max(0, MINUTES.indexOf(String(minute).padStart(2, "0")));
  const periodIndex = period;

  const emit = useCallback(
    (nextHour12: number, nextMinute: number, nextPeriod: DayPeriod) => {
      setHour12(nextHour12);
      setMinute(nextMinute);
      setPeriod(nextPeriod);
      onChange(toTimeHHmm(nextHour12, nextMinute, nextPeriod));
    },
    [onChange],
  );

  const periodItems = useMemo(() => PERIOD_LABELS, []);

  return (
    <WheelPickerFrame colors={colors} appearance={appearance}>
      <WheelPickerColumn
        items={HOURS}
        selectedIndex={hourIndex}
        flex={0.85}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(HOURS[index] as number, minute, period)}
      />
      <WheelPickerColumn
        items={MINUTES}
        selectedIndex={minuteIndex}
        flex={0.85}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(hour12, index, period)}
      />
      <WheelPickerColumn
        items={periodItems}
        selectedIndex={periodIndex}
        flex={0.75}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(hour12, minute, PERIODS[index] as DayPeriod)}
      />
    </WheelPickerFrame>
  );
}
