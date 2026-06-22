import {
  formatVolumeFromOz,
  formatWaterPreset,
  formatWaterVolume,
  formatWaterVolumeAlt,
  normalizeWaterDailyTargetOz,
  parseVolumeToOz,
  waterTargetPresets,
} from "@newyouai/core";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { IconDroplet } from "@/components/icons/FitnessIcons";
import { OnboardingFieldGroup } from "@/components/onboarding/OnboardingInputField";
import { SettingsHelper } from "@/components/settings/SettingsLayout";
import { GradientCard } from "@/components/ui/GradientCard";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MACRO_COLORS } from "@/lib/macroColors";
import { volumeUnitLabel } from "@/lib/unitLabels";

const HYDRATION_ACCENT = MACRO_COLORS.hydration;
const HYDRATION_ACCENT_SOFT = "rgba(90,154,232,0.16)";
const HYDRATION_ACCENT_BORDER = "rgba(90,154,232,0.42)";

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

  return (
    <>
      <SettingsHelper>
        Daily water intake target on the Nutrition tab. Display follows your volume unit in Preferences.
      </SettingsHelper>

      <View className="gap-4">
        <GradientCard accentColor={HYDRATION_ACCENT} testID="settings-hydration-hero">
          <View className="mb-3 flex-row items-center gap-2.5">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: HYDRATION_ACCENT_SOFT }}
            >
              <IconDroplet size={18} stroke={1.8} color={HYDRATION_ACCENT} />
            </View>
            <Text
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              Daily hydration
            </Text>
          </View>
          <Text className="text-[32px] font-bold tabular-nums" style={{ color: HYDRATION_ACCENT }}>
            {formatWaterVolume(state.waterDailyTargetOz, volumeUnit)}
          </Text>
          <Text className="mt-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
            {formatWaterVolumeAlt(state.waterDailyTargetOz, volumeUnit)}
          </Text>
        </GradientCard>

        <GradientCard testID="settings-hydration-targets">
          <Text
            className="mb-3 text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.textSecondary }}
          >
            Quick presets
          </Text>
          <View className="mb-4 flex-row flex-wrap" style={{ gap: 8 }}>
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
                    borderColor: selected ? HYDRATION_ACCENT_BORDER : colors.border,
                    backgroundColor: selected ? HYDRATION_ACCENT_SOFT : colors.backgroundSecondary,
                  }}
                >
                  <Text
                    className="text-[13px] font-semibold tabular-nums"
                    style={{ color: selected ? HYDRATION_ACCENT : colors.textSecondary }}
                  >
                    {formatWaterPreset(preset, volumeUnit)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <OnboardingFieldGroup
            label={`Custom target (${volumeUnitLabel(volumeUnit)})`}
            labelColor={colors.textTertiary}
          >
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
              className="rounded-[10px] border px-3 py-2.5 text-base tabular-nums"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.textPrimary,
              }}
            />
          </OnboardingFieldGroup>
          <Text className="mt-2 text-[12px] font-medium" style={{ color: colors.textTertiary }}>
            16–256 oz range · shown on your Nutrition tab
          </Text>
        </GradientCard>
      </View>
    </>
  );
}
