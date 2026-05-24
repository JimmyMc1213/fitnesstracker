import { useEffect, useMemo, useState } from "react";

import { localDateKey } from "./dailyPlan";
import { WHEEL_HEIGHT, WheelPickerColumn } from "./WheelPickerColumn";

const MIN_AGE = 13;
const MAX_AGE = 100;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parseDateOfBirth(value: string | undefined): { year: number; month: number; day: number } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return { year: y, month: m, day: d };
    }
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 30);
  fallback.setMonth(0);
  fallback.setDate(1);
  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

function toDateKey(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function yearRange(): number[] {
  const maxYear = new Date().getFullYear() - MIN_AGE;
  const minYear = new Date().getFullYear() - MAX_AGE;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y -= 1) years.push(y);
  return years;
}

export function DateOfBirthWheelPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const parsed = parseDateOfBirth(value);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);
  const [year, setYear] = useState(parsed.year);

  useEffect(() => {
    const next = parseDateOfBirth(value);
    setMonth(next.month);
    setDay(next.day);
    setYear(next.year);
  }, [value]);

  const years = useMemo(() => yearRange(), []);
  const monthItems = useMemo(
    () => MONTHS.map((label, index) => ({ value: index + 1, label })),
    [],
  );
  const dayItems = useMemo(() => {
    const count = daysInMonth(year, month);
    return Array.from({ length: count }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  }, [year, month]);
  const yearItems = useMemo(
    () => years.map((y) => ({ value: y, label: String(y) })),
    [years],
  );

  function emit(nextYear: number, nextMonth: number, nextDay: number) {
    const clampedDay = clampDay(nextYear, nextMonth, nextDay);
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(clampedDay);
    onChange(toDateKey(nextYear, nextMonth, clampedDay));
  }

  useEffect(() => {
    const maxDay = daysInMonth(year, month);
    if (day <= maxDay) return;
    emit(year, month, maxDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, dayItems.length]);

  return (
    <div className="dob-wheel-picker" style={{ height: WHEEL_HEIGHT }}>
      <div className="dob-wheel-picker__highlight" aria-hidden />
      <div className="dob-wheel-picker__columns">
        <WheelPickerColumn
          ariaLabel="Birth month"
          align="end"
          items={monthItems}
          value={month}
          onChange={(nextMonth) => emit(year, nextMonth, day)}
        />
        <WheelPickerColumn
          ariaLabel="Birth day"
          items={dayItems}
          value={Math.min(day, dayItems.length)}
          onChange={(nextDay) => emit(year, month, nextDay)}
        />
        <WheelPickerColumn
          ariaLabel="Birth year"
          align="start"
          items={yearItems}
          value={year}
          onChange={(nextYear) => emit(nextYear, month, day)}
        />
      </div>
    </div>
  );
}

export function defaultOnboardingDateOfBirth(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 30);
  d.setMonth(0);
  d.setDate(1);
  return localDateKey(d);
}
