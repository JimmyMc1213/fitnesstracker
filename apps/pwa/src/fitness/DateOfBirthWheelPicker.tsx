import { useMemo } from "react";

import { DateWheelPicker } from "@/components/ui/date-wheel-picker";

import { localDateKey } from "./dailyPlan";

const MIN_AGE = 13;
const MAX_AGE = 100;

function parseDateOfBirth(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return new Date(y, m - 1, d);
    }
  }
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() - 30);
  fallback.setMonth(0);
  fallback.setDate(1);
  return fallback;
}

export function DateOfBirthWheelPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const minYear = useMemo(() => new Date().getFullYear() - MAX_AGE, []);
  const maxYear = useMemo(() => new Date().getFullYear() - MIN_AGE, []);
  const dateValue = useMemo(() => parseDateOfBirth(value), [value]);

  return (
    <div className="dob-wheel-picker-wrap">
      <DateWheelPicker
        value={dateValue}
        onChange={(date) => onChange(localDateKey(date))}
        minYear={minYear}
        maxYear={maxYear}
        size="md"
      />
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
