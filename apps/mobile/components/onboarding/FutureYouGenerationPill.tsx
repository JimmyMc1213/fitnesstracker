import type { FutureYouJobStatus, NutritionGoal, UserGender } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  buildFutureYouGenerationPillPhrases,
  FUTURE_YOU_GENERATION_PILL_ROTATE_MS,
  futureYouGenerationPillCopy,
} from "@/lib/futureYouGenerationPillModel";

type Props = {
  status: FutureYouJobStatus | "idle";
  motivationId?: string;
  goal: NutritionGoal;
  gender: UserGender;
};

/** Onboarding generation pill with rotating motivation phrases. */
export function FutureYouGenerationPill({ status, motivationId, goal, gender }: Props) {
  const { ob } = useOnboardingTheme();
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = useMemo(
    () => buildFutureYouGenerationPillPhrases(motivationId, goal, gender),
    [motivationId, goal, gender],
  );

  const copy = futureYouGenerationPillCopy(status, phraseIndex, phrases);
  // Spin/rotate only while actively generating — both ready and failed are terminal.
  const isLoading = !copy.ready && !copy.failed;

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, FUTURE_YOU_GENERATION_PILL_ROTATE_MS);
    return () => clearInterval(id);
  }, [isLoading, phrases.length]);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      style={{
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 9999,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderColor: "rgba(201, 168, 118, 0.42)",
        backgroundColor: "#161410",
      }}
    >
      {isLoading ? <ActivityIndicator size="small" color={ob.goldMid} /> : null}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold" style={{ color: ob.gold }}>
          {copy.headline}
        </Text>
        {copy.subline ? (
          <Text className="text-xs" style={{ color: "rgba(212, 184, 138, 0.78)" }}>
            {copy.subline}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
