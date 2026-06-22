import { useCallback, useMemo } from "react";

import {
  useWheelPickerColors,
  WheelPickerColumn,
  WheelPickerFrame,
} from "@/components/ui/WheelPickerColumn";

export type DateWheelPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  minYear: number;
  maxYear: number;
  /** When false, the wheel scrolls but no row is styled as selected until the parent commits a value. */
  highlightSelection?: boolean;
};

function getMonthNames(): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }),
  );
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DateWheelPicker({
  value,
  onChange,
  minYear,
  maxYear,
  highlightSelection = true,
}: DateWheelPickerProps) {
  const colors = useWheelPickerColors();

  const months = useMemo(() => getMonthNames(), []);
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      arr.push(year);
    }
    return arr;
  }, [minYear, maxYear]);

  const month = value.getMonth();
  const day = value.getDate();
  const year = value.getFullYear();

  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month],
  );

  const yearIndex = Math.max(0, years.indexOf(year));
  const dayIndex = Math.max(0, Math.min(day - 1, days.length - 1));

  const emit = useCallback(
    (nextYear: number, nextMonth: number, nextDay: number) => {
      const maxDay = daysInMonth(nextYear, nextMonth);
      const safeDay = Math.min(nextDay, maxDay);
      onChange(new Date(nextYear, nextMonth, safeDay));
    },
    [onChange],
  );

  return (
    <WheelPickerFrame colors={colors}>
      <WheelPickerColumn
        items={months}
        selectedIndex={month}
        flex={1.35}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(year, index, day)}
      />
      <WheelPickerColumn
        items={days}
        selectedIndex={dayIndex}
        flex={0.75}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(year, month, days[index] as number)}
      />
      <WheelPickerColumn
        items={years}
        selectedIndex={yearIndex}
        flex={0.9}
        colors={colors}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(years[index] as number, month, day)}
      />
    </WheelPickerFrame>
  );
}

/** Re-export for callers that referenced layout constants from this module. */
export { WHEEL_HEIGHT } from "@/components/ui/WheelPickerColumn";
