import { useEffect, useMemo } from "react";
import { FlatList, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  defaultOnboardingDateOfBirth,
  isValidOnboardingDateOfBirth,
  localDateKey,
} from "@/lib/onboardingProfile";

const MIN_AGE = 13;
const MAX_AGE = 100;
const ITEM_HEIGHT = 44;

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
];

function parseDateOfBirth(value: string | undefined): { year: number; month: number; day: number } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return { year: y, month: m, day: d };
    }
  }
  const fallback = defaultOnboardingDateOfBirth();
  const [y, m, d] = fallback.split("-").map(Number);
  return { year: y, month: m, day: d };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

type WheelColumnProps = {
  data: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width?: number;
};

function WheelColumn({ data, selectedIndex, onSelect, width = 100 }: WheelColumnProps) {
  const { colors } = useAppTheme();

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => `${item}-${index}`}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      style={{ height: ITEM_HEIGHT * 5, width }}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      initialScrollIndex={Math.max(0, selectedIndex)}
      getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
      onMomentumScrollEnd={(event) => {
        const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(index, data.length - 1));
        onSelect(clamped);
      }}
      renderItem={({ item, index }) => {
        const selected = index === selectedIndex;
        return (
          <View style={{ height: ITEM_HEIGHT, justifyContent: "center", alignItems: "center" }}>
            <Text
              className="text-base"
              style={{
                color: selected ? colors.textPrimary : colors.textTertiary,
                fontWeight: selected ? "600" : "400",
              }}
            >
              {item}
            </Text>
          </View>
        );
      }}
    />
  );
}

export function DateOfBirthPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  const parsed = useMemo(() => parseDateOfBirth(value), [value]);
  const minYear = useMemo(() => new Date().getFullYear() - MAX_AGE, []);
  const maxYear = useMemo(() => new Date().getFullYear() - MIN_AGE, []);

  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear],
  );
  const days = useMemo(
    () => Array.from({ length: daysInMonth(parsed.year, parsed.month) }, (_, i) => i + 1),
    [parsed.year, parsed.month],
  );

  const yearIndex = Math.max(0, years.indexOf(parsed.year));
  const monthIndex = Math.max(0, parsed.month - 1);
  const dayIndex = Math.max(0, Math.min(parsed.day - 1, days.length - 1));

  const emit = (year: number, month: number, day: number) => {
    const maxDay = daysInMonth(year, month);
    const safeDay = Math.min(day, maxDay);
    onChange(localDateKey(new Date(year, month - 1, safeDay)));
  };

  useEffect(() => {
    if (!isValidOnboardingDateOfBirth(value)) {
      const fallback = parseDateOfBirth(defaultOnboardingDateOfBirth());
      emit(fallback.year, fallback.month, fallback.day);
    }
    // Seed a valid default so Continue works without wheel interaction (E2E + faster onboarding).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="flex-row justify-center">
        <WheelColumn
          data={MONTHS}
          selectedIndex={monthIndex}
          width={130}
          onSelect={(index) => emit(parsed.year, index + 1, parsed.day)}
        />
        <WheelColumn
          data={days}
          selectedIndex={dayIndex}
          width={56}
          onSelect={(index) => emit(parsed.year, parsed.month, days[index] as number)}
        />
        <WheelColumn
          data={years}
          selectedIndex={yearIndex}
          width={80}
          onSelect={(index) => emit(years[index] as number, parsed.month, parsed.day)}
        />
      </View>
    </View>
  );
}
