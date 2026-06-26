import type { FutureYouJobStatus, NutritionGoal, UserGender } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { FutureYouGeneratingLoader } from "@/components/future-you/FutureYouGeneratingLoader";
import { OnboardingFutureYouSuccessHero } from "@/components/onboarding/OnboardingFutureYouSuccessHero";
import {
  buildFutureYouGenerationPillPhrases,
  FUTURE_YOU_GENERATION_PILL_ROTATE_MS,
  futureYouGenerationPillCopy,
} from "@/lib/futureYouGenerationPillModel";

type Props = {
  goal: NutritionGoal;
  gender: UserGender | undefined;
  motivationId: string | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  imageUri?: string | null;
  placeholderSource: ImageSourcePropType | null;
  fill?: boolean;
};

/** In-app Future You generation screen: gold loader over the dimmed source preview. */
export function FutureYouGenerationLoadingView({
  goal,
  gender,
  motivationId,
  generationStatus,
  imageUri = null,
  placeholderSource,
  fill = false,
}: Props) {
  const status: FutureYouJobStatus | "idle" =
    generationStatus === "idle" ? "generating" : generationStatus;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = useMemo(
    () => buildFutureYouGenerationPillPhrases(motivationId, goal, gender ?? "other"),
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
    <View
      testID="future-you-generation-loading"
      className={fill ? "min-h-0 flex-1" : "pt-2"}
      accessibilityLiveRegion="polite"
    >
      <View className={fill ? "relative min-h-0 w-full flex-1" : "relative"}>
        <OnboardingFutureYouSuccessHero
          fill={fill}
          imageUri={imageUri}
          placeholderSource={placeholderSource}
        />
        <View
          className="absolute inset-0 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(10, 8, 4, 0.58)", borderRadius: 16 }}
          pointerEvents="none"
        >
          <FutureYouGeneratingLoader size={58} caption={copy.subline ?? copy.headline} />
        </View>
      </View>
    </View>
  );
}
