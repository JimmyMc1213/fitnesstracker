import { useMemo, useState } from "react";
import { View } from "react-native";

import { DateWheelPicker } from "@/components/onboarding/DateWheelPicker";
import {
  defaultOnboardingDateOfBirth,
  localDateKey,
} from "@/lib/onboardingProfile";

const MIN_AGE = 13;
const MAX_AGE = 100;

function parseDateOfBirth(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return new Date(y, m - 1, d);
    }
  }
  const fallback = defaultOnboardingDateOfBirth();
  const [y, m, d] = fallback.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DateOfBirthPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const minYear = useMemo(() => new Date().getFullYear() - MAX_AGE, []);
  const maxYear = useMemo(() => new Date().getFullYear() - MIN_AGE, []);
  const [wheelDate, setWheelDate] = useState(() => parseDateOfBirth(value));
  const dateValue = useMemo(() => (value ? parseDateOfBirth(value) : wheelDate), [value, wheelDate]);

  return (
    <View style={{ width: "100%" }}>
      <DateWheelPicker
        value={dateValue}
        onChange={(date) => {
          setWheelDate(date);
          onChange(localDateKey(date));
        }}
        highlightSelection={Boolean(value)}
        minYear={minYear}
        maxYear={maxYear}
      />
    </View>
  );
}
