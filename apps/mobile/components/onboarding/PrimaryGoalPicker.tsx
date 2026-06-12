import type { NutritionGoal } from "@newyouai/types";

import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";

const GOALS: NutritionGoal[] = ["cut", "bulk", "maintain"];

function goalLabel(goal: NutritionGoal): string {
  if (goal === "cut") return "Lose weight";
  if (goal === "bulk") return "Build muscle";
  return "Maintain and perform";
}

export function PrimaryGoalPicker({
  value,
  onChange,
}: {
  value?: NutritionGoal;
  onChange: (goal: NutritionGoal) => void;
}) {
  return (
    <OnboardingPillStack>
      {GOALS.map((g) => (
        <OnboardingSegment key={g} selected={value === g} onPress={() => onChange(g)}>
          {goalLabel(g)}
        </OnboardingSegment>
      ))}
    </OnboardingPillStack>
  );
}
