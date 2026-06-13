import {
  formatVolumeFromOz,
  formatWaterPreset,
  formatWaterVolumeAlt,
  normalizeWaterDailyTargetOz,
  parseVolumeToOz,
  waterTargetPresets,
} from "@newyouai/core";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View, type TextStyle } from "react-native";

import {
  SettingsDetailCard,
  SettingsFieldLabel,
  SettingsHelper,
} from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { volumeUnitLabel } from "@/lib/unitLabels";

const PRESET_SELECTED_BORDER = "rgba(120,200,255,0.55)";
const PRESET_SELECTED_BG = "rgba(120,200,255,0.12)";
const PRESET_SELECTED_COLOR = "#78c8ff";

export function HydrationPanel() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const volumeUnit = state?.unitPreferences.volumeUnit ?? "oz";
  const [waterTargetIn, setWaterTargetIn] = useState("");

  useEffect(() => {
    if (!state) return;
    setWaterTargetIn(formatVolumeFromOz(state.waterDailyTargetOz, volumeUnit));
  }, [state?.waterDailyTargetOz, volumeUnit]);

  if (!state) return null;

  function commitWaterTarget(raw: string) {
    const n = volumeUnit === "L" ? parseFloat(raw) : parseInt(raw, 10);
    const ozRaw = volumeUnit === "L" ? parseVolumeToOz(n, "L") : n;
    const val = normalizeWaterDailyTargetOz(Number.isFinite(ozRaw) ? ozRaw : undefined);
    setWaterTargetIn(formatVolumeFromOz(val, volumeUnit));
    setFitnessState((prev) => ({
      ...prev,
      waterDailyTargetOz: val,
    }));
  }

  const inputStyle: TextStyle = {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  };

  return (
    <>
      <SettingsHelper>
        Daily water intake target on the Nutrition tab. Display follows your volume unit in Preferences.
      </SettingsHelper>
      <SettingsDetailCard>
        <View className="mb-3.5 flex-row flex-wrap" style={{ gap: 8 }}>
          {waterTargetPresets(volumeUnit).map((preset) => {
            const presetOz =
              volumeUnit === "L"
                ? normalizeWaterDailyTargetOz(parseVolumeToOz(preset, "L"))
                : preset;
            const selected = state.waterDailyTargetOz === presetOz;
            return (
              <Pressable
                key={preset}
                testID={`settings-hydration-preset-${preset}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => commitWaterTarget(String(preset))}
                className="rounded-[10px] px-3.5 py-2.5"
                style={{
                  borderWidth: 0.5,
                  borderColor: selected ? PRESET_SELECTED_BORDER : colors.border,
                  backgroundColor: selected ? PRESET_SELECTED_BG : colors.backgroundSecondary,
                }}
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: selected ? PRESET_SELECTED_COLOR : colors.textSecondary }}
                >
                  {formatWaterPreset(preset, volumeUnit)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SettingsFieldLabel>Custom target ({volumeUnitLabel(volumeUnit)})</SettingsFieldLabel>
        <TextInput
          testID="settings-hydration-custom"
          value={waterTargetIn}
          onChangeText={(v) => {
            setWaterTargetIn(v);
            if (v === "" || v === "-") return;
            const n = volumeUnit === "L" ? parseFloat(v) : parseInt(v, 10);
            if (!Number.isFinite(n)) return;
            const ozRaw = volumeUnit === "L" ? parseVolumeToOz(n, "L") : n;
            if (ozRaw >= 16 && ozRaw <= 256) {
              setFitnessState((prev) => ({
                ...prev,
                waterDailyTargetOz: Math.round(ozRaw),
              }));
            }
          }}
          onBlur={() => commitWaterTarget(waterTargetIn)}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={`Daily water target in ${volumeUnitLabel(volumeUnit)}`}
          style={inputStyle}
        />
        <Text className="mt-2 text-[12px] font-medium" style={{ color: colors.textSecondary }}>
          {formatWaterVolumeAlt(state.waterDailyTargetOz, volumeUnit)}
        </Text>
      </SettingsDetailCard>
    </>
  );
}
