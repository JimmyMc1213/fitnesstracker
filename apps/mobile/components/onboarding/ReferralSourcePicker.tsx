import type { ReferralSource } from "@newyouai/types";
import type { ImageSourcePropType } from "react-native";
import { Image, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  ONBOARDING_OPTION_GAP,
  ONBOARDING_OPTION_ICON_GAP,
  ONBOARDING_OPTION_MIN_HEIGHT,
  onboardingOptionColors,
} from "@/lib/onboardingTheme";
import { REFERRAL_SOURCES, referralSourceLabel } from "@/lib/referralSource";

const BRAND_ICON_IMAGES: Partial<Record<ReferralSource, ImageSourcePropType>> = {
  instagram: require("@/assets/brand-icons/instagram.png"),
  tiktok: require("@/assets/brand-icons/tiktok.png"),
  youtube: require("@/assets/brand-icons/youtube.png"),
  reddit: require("@/assets/brand-icons/reddit.png"),
  google: require("@/assets/brand-icons/google.png"),
  facebook: require("@/assets/brand-icons/facebook.png"),
  app_store: require("@/assets/brand-icons/appstore.png"),
  x: require("@/assets/brand-icons/x.png"),
};

const EMOJI_ICONS: Partial<Record<ReferralSource, string>> = {
  friend: "👥",
  other: "💬",
};

const ICON_SIZE = 32;

function ReferralSourceIcon({ source }: { source: ReferralSource }) {
  const image = BRAND_ICON_IMAGES[source];
  if (image) {
    return (
      <Image
        source={image}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 22, lineHeight: 24 }}>{EMOJI_ICONS[source] ?? "💬"}</Text>
    </View>
  );
}

export function ReferralSourcePicker({
  value,
  onChange,
}: {
  value?: ReferralSource;
  onChange: (source: ReferralSource) => void;
}) {
  const { ob } = useOnboardingTheme();

  return (
    <View style={{ gap: ONBOARDING_OPTION_GAP }}>
      {REFERRAL_SOURCES.map((source) => {
        const selected = value === source;
        const option = onboardingOptionColors(ob, selected);
        return (
          <PressableScale
            key={source}
            onPress={() => onChange(source)}
            testID={`onboarding-referral-${source}`}
            activeScale={0.97}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              minHeight: ONBOARDING_OPTION_MIN_HEIGHT,
              flexDirection: "row",
              alignItems: "center",
              gap: ONBOARDING_OPTION_ICON_GAP,
              borderRadius: 9999,
              borderWidth: 1.5,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderColor: option.borderColor,
              backgroundColor: option.backgroundColor,
            }}
          >
            <ReferralSourceIcon source={source} />
            <Text
              className={`flex-1 text-base ${selected ? "font-semibold" : "font-medium"}`}
              style={{ color: option.color }}
            >
              {referralSourceLabel(source)}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
