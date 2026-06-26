import { View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { OnboardingFutureYouHeroImage } from "@/components/onboarding/OnboardingFutureYouHeroImage";

type Props = {
  imageUri: string | null;
  placeholderSource: ImageSourcePropType | null;
  loading?: boolean;
  /** Grow the hero image to fill available vertical space. */
  fill?: boolean;
  /** Fixed hero image height when not filling. Defaults to 224. */
  imageHeight?: number;
};

/** Future You tab hero — image only. Paywall/unlock screens use their own timeline copy. */
export function OnboardingFutureYouSuccessHero({
  imageUri,
  placeholderSource,
  loading = false,
  fill = false,
  imageHeight,
}: Props) {
  return (
    <View className={`items-center${fill ? " min-h-0 w-full flex-1" : ""}`}>
      <OnboardingFutureYouHeroImage
        imageUri={imageUri}
        placeholderSource={placeholderSource}
        preparing={loading}
        blur={false}
        fill={fill}
        imageHeight={imageHeight}
      />
    </View>
  );
}
