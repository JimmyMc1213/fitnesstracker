import { useEffect, useState } from "react";
import { Text } from "react-native";

import {
  SettingsDetailCard,
  SettingsFormField,
  SettingsTextField,
} from "@/components/settings/SettingsLayout";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";

function clampStepsTarget(n: number) {
  return Math.min(100_000, Math.max(1000, n));
}

export function ProgramPanel() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const [stepsIn, setStepsIn] = useState("");

  useEffect(() => {
    if (!state) return;
    setStepsIn(String(state.stepsTarget));
  }, [state?.stepsTarget]);

  if (!state) return null;

  function commitStepsTarget(raw: string) {
    const n = parseInt(raw, 10);
    const val = clampStepsTarget(Number.isFinite(n) ? n : state!.stepsTarget);
    setStepsIn(String(val));
    setFitnessState((prev) => ({
      ...prev,
      stepsTarget: val,
    }));
  }

  return (
    <SettingsDetailCard>
      <SettingsFormField label="Steps goal">
        <SettingsTextField
          testID="settings-program-steps-target"
          value={stepsIn}
          onChangeText={(raw) => {
            const digits = raw.replace(/[^\d]/g, "");
            setStepsIn(digits);
            if (digits === "") return;
            const n = parseInt(digits, 10);
            if (!Number.isFinite(n)) return;
            setFitnessState((prev) => ({
              ...prev,
              stepsTarget: clampStepsTarget(n),
            }));
          }}
          onBlur={() => commitStepsTarget(stepsIn)}
          keyboardType="number-pad"
          inputMode="numeric"
          className="rounded-[12px] border px-3.5 py-3 text-[15px] tabular-nums"
          accessibilityLabel="Daily steps goal"
        />
      </SettingsFormField>
      <Text className="text-[12px] font-medium leading-[1.45]" style={{ color: colors.textTertiary }}>
        Shown on Home daily habits when a habit uses the runner icon.
      </Text>
    </SettingsDetailCard>
  );
}
