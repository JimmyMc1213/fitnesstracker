import type { NutritionGoal, UserGender } from "@newyouai/types";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import {
  getFutureYouGenericMotivations,
  getFutureYouSpecificMotivations,
  type FutureYouMotivation,
} from "@/lib/futureYouMotivations";

import { OnboardingSegment } from "./OnboardingSegment";

type Props = {
  goal: NutritionGoal;
  gender: UserGender;
  selectedId: string | undefined;
  onSelect: (motivationId: string, isGeneric: boolean) => void;
};

function MotivationSection({
  label,
  motivations,
  selectedId,
  onSelect,
}: {
  label: string;
  motivations: FutureYouMotivation[];
  selectedId: string | undefined;
  onSelect: Props["onSelect"];
}) {
  const { colors } = useAppTheme();

  if (motivations.length === 0) return null;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {motivations.map((motivation) => (
          <OnboardingSegment
            key={motivation.id}
            layout="inline"
            selected={selectedId === motivation.id}
            onPress={() => onSelect(motivation.id, motivation.isGeneric)}
          >
            {motivation.label}
          </OnboardingSegment>
        ))}
      </View>
    </View>
  );
}

export function OnboardingFutureYouMotivation({ goal, gender, selectedId, onSelect }: Props) {
  const generics = getFutureYouGenericMotivations(goal, gender);
  const specifics = getFutureYouSpecificMotivations(goal, gender);

  return (
    <View>
      <MotivationSection
        label="Popular"
        motivations={generics}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <MotivationSection
        label="More specific"
        motivations={specifics}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </View>
  );
}
