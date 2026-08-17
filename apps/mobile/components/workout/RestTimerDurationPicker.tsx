import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { AppTextField } from "@/components/ui/AppTextField";

import {
  clampRestTimerSeconds,
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
  const [selected, setSelected] = useState(value);
  const [customIn, setCustomIn] = useState(String(value));
  const selectedRef = useRef(value);
  const persistFrameRef = useRef<number | null>(null);

  useEffect(() => {
    selectedRef.current = value;
    setSelected(value);
    setCustomIn(String(value));
  }, [value]);

  useEffect(() => {
    return () => {
      if (persistFrameRef.current != null) cancelAnimationFrame(persistFrameRef.current);
    };
  }, []);

  function persist(seconds: number) {
    if (persistFrameRef.current != null) cancelAnimationFrame(persistFrameRef.current);
    persistFrameRef.current = requestAnimationFrame(() => {
      persistFrameRef.current = null;
      onChange(seconds);
    });
  }

  function pick(seconds: number) {
    if (seconds === selectedRef.current) return;
    selectedRef.current = seconds;
    setSelected(seconds);
    persist(seconds);
  }

  function commitCustom(raw: string) {
    const n = parseInt(raw, 10);
    const val = clampRestTimerSeconds(Number.isFinite(n) ? n : value);
    selectedRef.current = val;
    setSelected(val);
    setCustomIn(String(val));
    onChange(val);
  }

  return (
    <View>
      <View className="mb-3.5 flex-row flex-wrap gap-2">
        {REST_TIMER_PRESETS.map((sec) => {
          const isSelected = selected === sec;
          return (
            <Pressable
              key={sec}
              onPressIn={() => pick(sec)}
              className="min-w-[64px] flex-1 items-center rounded-[10px] border px-2 py-2.5"
              style={{
                borderColor: isSelected ? colors.textPrimary : colors.border,
                backgroundColor: isSelected ? colors.backgroundTertiary : colors.backgroundSecondary,
              }}
            >
              <Text
                className="text-[13px] font-semibold tabular-nums"
                style={{ color: isSelected ? colors.textPrimary : colors.textSecondary }}
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
          <AppTextField
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
            size="compact"
            shellStyle={{ marginTop: 8 }}
            style={{ fontVariant: ["tabular-nums"] }}
          />
        </>
      )}
    </View>
  );
}
