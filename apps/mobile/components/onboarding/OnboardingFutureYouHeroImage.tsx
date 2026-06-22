import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import { ActivityIndicator, Image, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { GradientCard } from "@/components/ui/GradientCard";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  imageUri: string | null;
  placeholderSource: ImageSourcePropType | null;
  preparing: boolean;
  /** Blurred paywall teaser; omit on post-pay success hero. */
  blur?: boolean;
  /** Grow to fill available vertical space instead of the fixed height. */
  fill?: boolean;
  /** Fixed frame height when not filling. Defaults to 224. */
  imageHeight?: number;
};

export function OnboardingFutureYouHeroImage({
  imageUri,
  placeholderSource,
  preparing,
  blur = true,
  fill = false,
  imageHeight = 224,
}: Props) {
  const { colors } = useAppTheme();
  const source = imageUri ? { uri: imageUri } : placeholderSource;
  const frameStyle = fill
    ? { flex: 1, width: "100%" as const }
    : { height: imageHeight, width: "100%" as const };

  return (
    <GradientCard padding={0} fill={fill} style={frameStyle}>
      <View
        style={{ ...frameStyle, alignItems: "center", justifyContent: "center" }}
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
    </GradientCard>
  );
}
