import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import { ActivityIndicator, Image, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  imageUri: string | null;
  placeholderSource: ImageSourcePropType | null;
  preparing: boolean;
  /** Blurred paywall teaser; omit on post-pay success hero. */
  blur?: boolean;
};

export function OnboardingFutureYouHeroImage({
  imageUri,
  placeholderSource,
  preparing,
  blur = true,
}: Props) {
  const { colors } = useAppTheme();
  const source = imageUri ? { uri: imageUri } : placeholderSource;

  return (
    <View
      className="relative h-56 w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
      accessibilityState={{ busy: preparing }}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          blurRadius={blur && imageUri ? 18 : 0}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="h-full w-full" style={{ backgroundColor: colors.border }} />
      )}
      {preparing ? (
        <View
          className="absolute inset-0 items-center justify-center gap-2 px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <ActivityIndicator color="#fff" />
          <Text className="text-center text-sm text-white">{FUTURE_YOU_HERO_LOADING_LABEL}</Text>
        </View>
      ) : null}
    </View>
  );
}
