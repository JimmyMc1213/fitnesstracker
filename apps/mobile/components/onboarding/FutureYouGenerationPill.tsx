import type { FutureYouJobStatus, NutritionGoal, UserGender } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
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
  const { colors } = useAppTheme();
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = useMemo(
    () => buildFutureYouGenerationPillPhrases(motivationId, goal, gender),
    [motivationId, goal, gender],
  );

  const copy = futureYouGenerationPillCopy(status, phraseIndex, phrases);
  const isReady = copy.ready;

  useEffect(() => {
    if (isReady) return;
    const id = setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, FUTURE_YOU_GENERATION_PILL_ROTATE_MS);
    return () => clearInterval(id);
  }, [isReady, phrases.length]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      className="mb-3 flex-row items-center gap-2 rounded-full border px-4 py-2.5"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      {!isReady ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
          {copy.headline}
        </Text>
        {copy.subline ? (
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {copy.subline}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
