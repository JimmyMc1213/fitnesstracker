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
import { SettingsFieldLabel } from "@/components/settings/SettingsLayout";
import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { goalWeightDirectionLabel, goalWeightRangeLbs } from "@/lib/goalWeight";

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
    <View style={{ gap: 24 }}>
      <View style={{ gap: 12 }}>
        <SettingsFieldLabel>Primary goal</SettingsFieldLabel>
        <OnboardingPillStack>
          {NUTRITION_GOALS.map((g) => (
            <OnboardingSegment key={g} selected={goal === g} onPress={() => onChange({ goal: g })}>
              {nutritionGoalSettingsLabel(g)}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </View>

      {goal !== "maintain" ? (
        <>
          <View style={{ gap: 12 }}>
            <SettingsFieldLabel>Desired weight</SettingsFieldLabel>
            <GradientCard spacious>
              {(() => {
                const typedGoal = goal as "cut" | "bulk";
                const { minLbs, maxLbs } = goalWeightRangeLbs(typedGoal, currentWeightLbs);
                const valueLbs = clampGoalWeightLbs(
                  profile.goalWeightLbs ?? defaultGoalWeightLbs(typedGoal, currentWeightLbs),
                  minLbs,
                  maxLbs,
                );
                return (
                  <View style={{ gap: 14 }}>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      {goalWeightDirectionLabel(goal)}
                    </Text>
                    <OnboardingWeightInput
                      unit={weightUnit}
                      weightLbs={valueLbs}
                      resetKey={`${goal}-${weightUnit}-${currentWeightLbs}`}
                      onWeightChange={(goalWeightLbs) => onChange({ goalWeightLbs })}
                    />
                  </View>
                );
              })()}
            </GradientCard>
            {!isGoalWeightValid(profile, currentWeightLbs) ? (
              <Text className="text-[13px]" style={{ color: "#f87171" }}>
                Pick a target at least 3 lb from your current weight.
              </Text>
            ) : null}
          </View>

          <View style={{ gap: 12 }}>
            <SettingsFieldLabel>Pace</SettingsFieldLabel>
            <PacePicker value={profile.pace} onChange={(pace) => onChange({ pace })} />
          </View>
        </>
      ) : null}
    </View>
  );
}
