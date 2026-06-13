import {
  clampGoalWeightLbs,
  defaultGoalWeightLbs,
  isGoalWeightValid,
  NUTRITION_GOALS,
  nutritionGoalSettingsLabel,
} from "@newyouai/core";
import type { OnboardingProfile, WeightUnit } from "@newyouai/types";
import { Text, View } from "react-native";

import { OnboardingWeightInput } from "@/components/onboarding/OnboardingWeightInput";
import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { PacePicker } from "@/components/onboarding/PacePicker";
import { SettingsDetailCard, SettingsFieldLabel } from "@/components/settings/SettingsLayout";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  goalWeightDirectionLabel,
  goalWeightRangeLbs,
} from "@/lib/goalWeight";

export function GoalSettingsPicker({
  profile,
  currentWeightLbs,
  weightUnit,
  onChange,
}: {
  profile: OnboardingProfile;
  currentWeightLbs: number;
  weightUnit: WeightUnit;
  onChange: (patch: Partial<Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">>) => void;
}) {
  const { colors } = useAppTheme();
  const goal = profile.goal ?? "maintain";

  return (
    <View style={{ gap: 20 }}>
      <View>
        <SettingsFieldLabel>Primary goal</SettingsFieldLabel>
        <View className="mt-2">
          <OnboardingPillStack>
            {NUTRITION_GOALS.map((g) => (
              <OnboardingSegment key={g} selected={goal === g} onPress={() => onChange({ goal: g })}>
                {nutritionGoalSettingsLabel(g)}
              </OnboardingSegment>
            ))}
          </OnboardingPillStack>
        </View>
      </View>

      {goal !== "maintain" ? (
        <>
          <View>
            <SettingsFieldLabel>Desired weight</SettingsFieldLabel>
            <SettingsDetailCard>
              {(() => {
                const typedGoal = goal as "cut" | "bulk";
                const { minLbs, maxLbs } = goalWeightRangeLbs(typedGoal, currentWeightLbs);
                const valueLbs = clampGoalWeightLbs(
                  profile.goalWeightLbs ?? defaultGoalWeightLbs(typedGoal, currentWeightLbs),
                  minLbs,
                  maxLbs,
                );
                return (
                  <>
                    <Text className="mb-3 text-sm" style={{ color: colors.textSecondary }}>
                      {goalWeightDirectionLabel(goal)}
                    </Text>
                    <OnboardingWeightInput
                      unit={weightUnit}
                      weightLbs={valueLbs}
                      resetKey={`${goal}-${weightUnit}-${currentWeightLbs}`}
                      onWeightChange={(goalWeightLbs) => onChange({ goalWeightLbs })}
                    />
                  </>
                );
              })()}
            </SettingsDetailCard>
            {!isGoalWeightValid(profile, currentWeightLbs) ? (
              <Text className="mt-2 text-[13px]" style={{ color: "#f87171" }}>
                Pick a target at least 3 lb from your current weight.
              </Text>
            ) : null}
          </View>

          <View>
            <SettingsFieldLabel>Pace</SettingsFieldLabel>
            <View className="mt-2">
              <PacePicker value={profile.pace} onChange={(pace) => onChange({ pace })} />
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}
