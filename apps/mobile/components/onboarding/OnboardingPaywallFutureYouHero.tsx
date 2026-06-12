import type { FutureYouJobStatus } from "@newyouai/types";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useFutureYouPaywallImage } from "@/hooks/useFutureYouPaywallImage";
import { splitFutureYouTimelineForPaywall } from "@/lib/futureYouTimeline";

type Props = {
  timeline: string;
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
};

/** Blurred Future You hero teaser on paywall. */
export function OnboardingPaywallFutureYouHero({ timeline, jobId, status }: Props) {
  const { colors } = useAppTheme();
  const { imageUri, loading } = useFutureYouPaywallImage({ jobId, status });
  const preparing = status !== "ready" || loading;
  const { value: timelineValue, unit: timelineUnit } = splitFutureYouTimelineForPaywall(timeline);

  return (
    <View testID="onboarding-paywall-future-you-hero" className="items-center gap-4">
      <Text className="text-center text-lg font-semibold" style={{ color: colors.textPrimary }}>
        <Text style={{ color: colors.accent }}>Future You</Text> is ready
      </Text>

      <View
        className="h-48 w-full items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
      >
        {preparing ? (
          <ActivityIndicator color={colors.accent} />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            blurRadius={18}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="items-center px-6">
            <Text className="text-4xl opacity-30">🔒</Text>
            <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
              Unlock to reveal your Future You
            </Text>
          </View>
        )}
      </View>

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
