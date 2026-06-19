import { FUTURE_YOU_HERO_LOADING_LABEL } from "@newyouai/core";
import type { FutureYouJobStatus, UserGender } from "@newyouai/types";
import { ActivityIndicator, Image, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { OnboardingContentReveal } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useFutureYouPaywallImage } from "@/hooks/useFutureYouPaywallImage";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import { splitFutureYouTimelineForPaywall } from "@/lib/futureYouTimeline";
import { paywallRevealDelayMs } from "@/lib/onboardingPaywallReveal";

type Props = {
  timeline: string;
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
  gender: UserGender | undefined;
};

/** Gold ring color = `--ob-gold` (#c9a876) at 0.75, matching PWA `__image-wrap`. */
const GOLD_RING = "rgba(201, 168, 118, 0.75)";

/**
 * Static gold halo behind the hero box (PWA `__stage` radial glow, pulse omitted).
 * Alpha must come from `stopOpacity` — react-native-svg ignores the alpha channel
 * of an rgba() `stopColor`, which otherwise renders the gradient as a solid block.
 */
function HeroGlow({
  width,
  height,
  offsetX,
  offsetY,
}: {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}) {
  return (
    <Svg
      pointerEvents="none"
      width={width}
      height={height}
      style={{ position: "absolute", left: offsetX, top: offsetY }}
    >
      <Defs>
        <RadialGradient id="paywall-fy-glow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor="#e8cc96" stopOpacity={0.55} />
          <Stop offset="35%" stopColor="#d4b88a" stopOpacity={0.32} />
          <Stop offset="60%" stopColor="#c9a876" stopOpacity={0.13} />
          <Stop offset="100%" stopColor="#c9a876" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#paywall-fy-glow)" />
    </Svg>
  );
}

/** Blurred Future You hero teaser on paywall. */
export function OnboardingPaywallFutureYouHero({ timeline, jobId, status, gender }: Props) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { imageUri, loading } = useFutureYouPaywallImage({ jobId, status });
  const preparing = status !== "ready" || loading;
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  // Blurred gendered silhouette stands in until the real Future You photo lands.
  const silhouetteSource = futureYouSilhouettesForGender(gender)?.after ?? null;
  const teaserSource = imageUri ? { uri: imageUri } : silhouetteSource;

  const boxWidth = Math.min(212, screenWidth * 0.56);
  const boxHeight = (boxWidth * 4) / 3;
  const glowWidth = boxWidth * 1.65;
  const glowHeight = boxHeight * 1.4;
  const glowOffsetX = -(glowWidth - boxWidth) / 2;
  const glowOffsetY = -(glowHeight - boxHeight) / 2;

  return (
    <View testID="onboarding-paywall-future-you-hero" className="items-center gap-4">
      <OnboardingContentReveal delay={paywallRevealDelayMs(1)} style={{ alignItems: "center" }}>
        <Text className="text-center text-lg font-semibold" style={{ color: colors.textPrimary }}>
          <Text style={{ color: ob.gold }}>Future You</Text> is ready
        </Text>
      </OnboardingContentReveal>

      <OnboardingContentReveal
        delay={paywallRevealDelayMs(2)}
        style={{ alignItems: "center", justifyContent: "center", paddingVertical: 14 }}
      >
        <View style={{ width: boxWidth, height: boxHeight, alignItems: "center", justifyContent: "center" }}>
          <HeroGlow
            width={glowWidth}
            height={glowHeight}
            offsetX={glowOffsetX}
            offsetY={glowOffsetY}
          />
          <View
            accessibilityState={{ busy: preparing }}
            style={{
              width: boxWidth,
              height: boxHeight,
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: GOLD_RING,
              backgroundColor: colors.border,
              shadowColor: "#c9a876",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45,
              shadowRadius: 18,
              elevation: 8,
            }}
          >
            {teaserSource ? (
              <Image
                source={teaserSource}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                blurRadius={imageUri ? 18 : 12}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="h-full w-full" style={{ backgroundColor: colors.border }} />
            )}
            {preparing ? (
              <View
                className="absolute inset-0 items-center justify-center gap-3 px-4"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              >
                <ActivityIndicator color={ob.gold} />
                <Text className="text-center text-sm font-semibold text-white">
                  {FUTURE_YOU_HERO_LOADING_LABEL}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </OnboardingContentReveal>

      <OnboardingContentReveal delay={paywallRevealDelayMs(3)} style={{ alignItems: "center" }}>
        <Text className="text-center text-lg font-bold" style={{ color: colors.textPrimary }}>
          You in{" "}
          <Text className="font-bold" style={{ color: ob.gold }}>
            {timelineValue}
            {timelineUnit}
          </Text>
        </Text>
      </OnboardingContentReveal>
    </View>
  );
}
