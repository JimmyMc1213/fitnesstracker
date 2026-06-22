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
  /** Grow the hero image to fill available vertical space. */
  fill?: boolean;
  /** Fixed hero image height when not filling. Defaults to 224. */
  imageHeight?: number;
  /** Override the timeline highlight color (defaults to the theme accent). */
  accentColor?: string;
};

export function OnboardingFutureYouSuccessHero({
  timeline,
  imageUri,
  placeholderSource,
  loading = false,
  fill = false,
  imageHeight,
  accentColor,
}: Props) {
  const { colors } = useAppTheme();
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  return (
    <View className={`items-center${fill ? " min-h-0 w-full flex-1 gap-5" : " gap-3"}`}>
      <OnboardingFutureYouHeroImage
        imageUri={imageUri}
        placeholderSource={placeholderSource}
        preparing={loading}
        blur={false}
        fill={fill}
        imageHeight={imageHeight}
      />
      <Text
        className={`shrink-0 text-center text-base${fill ? " pb-1" : ""}`}
        style={{ color: colors.textPrimary }}
      >
        You in{" "}
        <Text className="font-bold" style={{ color: accentColor ?? colors.accent }}>
          {timelineValue}
          {timelineUnit}
        </Text>
      </Text>
    </View>
  );
}
