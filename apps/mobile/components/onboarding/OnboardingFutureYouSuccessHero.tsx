import { splitFutureYouTimelineForPaywall } from "@newyouai/core";
import { Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { OnboardingFutureYouHeroImage } from "@/components/onboarding/OnboardingFutureYouHeroImage";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  timeline: string;
  imageUri: string | null;
  placeholderSource: ImageSourcePropType | null;
  loading?: boolean;
};

export function OnboardingFutureYouSuccessHero({
  timeline,
  imageUri,
  placeholderSource,
  loading = false,
}: Props) {
  const { colors } = useAppTheme();
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  return (
    <View className="items-center gap-3">
      <OnboardingFutureYouHeroImage
        imageUri={imageUri}
        placeholderSource={placeholderSource}
        preparing={loading}
        blur={false}
      />
      <Text className="text-center text-base" style={{ color: colors.textPrimary }}>
        You in{" "}
        <Text className="font-bold" style={{ color: colors.accent }}>
          {timelineValue}
          {timelineUnit}
        </Text>
      </Text>
    </View>
  );
}
