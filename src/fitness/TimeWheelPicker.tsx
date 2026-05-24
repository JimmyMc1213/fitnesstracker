import { useEffect, useMemo, useState } from "react";

import { normalizeTimeHHmm } from "./notificationPreferences";
import { WHEEL_HEIGHT, WheelPickerColumn, type WheelItem } from "./WheelPickerColumn";

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

const HOUR_ITEMS: WheelItem[] = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1),
}));

const MINUTE_ITEMS: WheelItem[] = Array.from({ length: 60 }, (_, index) => ({
  value: index,
  label: String(index).padStart(2, "0"),
}));

const PERIOD_ITEMS: WheelItem[] = [
  { value: 0, label: "AM" },
  { value: 1, label: "PM" },
];

export function TimeWheelPicker({
  value,
  onChange,
  ariaLabel = "Reminder time",
  inline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  /** Compact styling for inline use inside notification rows. */
  inline?: boolean;
}) {
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

  const periodItems = useMemo(() => PERIOD_ITEMS, []);

  function emit(nextHour12: number, nextMinute: number, nextPeriod: DayPeriod) {
    setHour12(nextHour12);
    setMinute(nextMinute);
    setPeriod(nextPeriod);
    onChange(toTimeHHmm(nextHour12, nextMinute, nextPeriod));
  }

  return (
    <div
      className={inline ? "time-wheel-picker time-wheel-picker--inline" : "time-wheel-picker"}
      style={{ height: WHEEL_HEIGHT }}
      aria-label={ariaLabel}
    >
      <div className="dob-wheel-picker__highlight" aria-hidden />
      <div className="time-wheel-picker__columns">
        <WheelPickerColumn
          ariaLabel="Hour"
          align="end"
          items={HOUR_ITEMS}
          value={hour12}
          onChange={(nextHour) => emit(nextHour, minute, period)}
        />
        <WheelPickerColumn
          ariaLabel="Minute"
          items={MINUTE_ITEMS}
          value={minute}
          onChange={(nextMinute) => emit(hour12, nextMinute, period)}
        />
        <WheelPickerColumn
          ariaLabel="AM or PM"
          align="start"
          items={periodItems}
          value={period}
          onChange={(nextPeriod) => emit(hour12, minute, nextPeriod as DayPeriod)}
        />
      </div>
    </div>
  );
}
