import { Text, TextInput } from "react-native";

import {
  SettingsDetailCard,
  SettingsFieldLabel,
} from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export function ProgramPanel() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();

  if (!state) return null;

  return (
    <SettingsDetailCard>
      <SettingsFieldLabel>Steps goal</SettingsFieldLabel>
      <TextInput
        testID="settings-program-steps-target"
        value={String(state.stepsTarget)}
        onChangeText={(raw) => {
          const n = parseInt(raw, 10);
          if (!Number.isFinite(n)) return;
          const stepsTarget = Math.min(100_000, Math.max(1000, n));
          setFitnessState((prev) => ({
            ...prev,
            stepsTarget,
          }));
        }}
        keyboardType="number-pad"
        inputMode="numeric"
        className="mt-2 rounded-xl border px-3 py-2.5 text-base tabular-nums"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.backgroundSecondary,
          color: colors.textPrimary,
        }}
        accessibilityLabel="Daily steps goal"
      />
      <Text className="mt-2 text-xs" style={{ color: colors.textTertiary }}>
        Shown on Home daily habits when a habit uses the runner icon.
      </Text>
    </SettingsDetailCard>
  );
}
