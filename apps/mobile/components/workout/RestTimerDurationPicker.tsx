import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  clampRestTimerSeconds,
  formatRestDuration,
  MAX_REST_TIMER_SECONDS,
  MIN_REST_TIMER_SECONDS,
  REST_TIMER_PRESETS,
} from "@/lib/workout/restTimerPreferences";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  value: number;
  onChange: (seconds: number) => void;
  variant?: "settings" | "sheet";
};

export function RestTimerDurationPicker({ value, onChange, variant = "settings" }: Props) {
  const { colors } = useAppTheme();
  const [customIn, setCustomIn] = useState(String(value));

  useEffect(() => {
    setCustomIn(String(value));
  }, [value]);

  function commitCustom(raw: string) {
    const n = parseInt(raw, 10);
    const val = clampRestTimerSeconds(Number.isFinite(n) ? n : value);
    setCustomIn(String(val));
    onChange(val);
  }

  return (
    <View>
      <View className="mb-3.5 flex-row flex-wrap gap-2">
        {REST_TIMER_PRESETS.map((sec) => {
          const selected = value === sec;
          return (
            <Pressable
              key={sec}
              onPress={() => onChange(sec)}
              className="min-w-[64px] flex-1 items-center rounded-[10px] border px-2 py-2.5"
              style={{
                borderColor: selected ? colors.textPrimary : colors.border,
                backgroundColor: selected ? colors.backgroundTertiary : colors.backgroundSecondary,
              }}
            >
              <Text
                className="text-[13px] font-semibold tabular-nums"
                style={{ color: selected ? colors.textPrimary : colors.textSecondary }}
              >
                {sec}s
              </Text>
            </Pressable>
          );
        })}
      </View>
      {variant === "sheet" ? null : (
        <>
          <Text className="text-[11px] font-medium uppercase tracking-widest" style={{ color: colors.textTertiary }}>
            Custom (seconds)
          </Text>
          <TextInput
            value={customIn}
            onChangeText={(v) => {
              setCustomIn(v);
              if (v === "" || v === "-") return;
              const n = parseInt(v, 10);
              if (!Number.isFinite(n)) return;
              if (n >= MIN_REST_TIMER_SECONDS && n <= MAX_REST_TIMER_SECONDS) onChange(n);
            }}
            onBlur={() => commitCustom(customIn)}
            keyboardType="number-pad"
            className="mt-2 rounded-[10px] border px-3 py-2.5 text-base tabular-nums"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
              color: colors.textPrimary,
            }}
          />
        </>
      )}
      <Text className="mt-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
        {MIN_REST_TIMER_SECONDS}s–{formatRestDuration(MAX_REST_TIMER_SECONDS)} allowed
      </Text>
    </View>
  );
}
