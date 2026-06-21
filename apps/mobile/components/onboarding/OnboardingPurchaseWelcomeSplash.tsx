import { PURCHASE_WELCOME_HEADLINE } from "@newyouai/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet } from "react-native";

import NewYouUnlockSplash from "@/components/onboarding/NewYouUnlockSplash";
import { PURCHASE_WELCOME_SPLASH_FADE_OUT_MS } from "@/lib/splashTiming";

const UNLOCK_ANIMATION_MS = 2700 + 160;

type Props = {
  onComplete: () => void;
};

export function OnboardingPurchaseWelcomeSplash({ onComplete }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const completedRef = useRef(false);
  const [visible, setVisible] = useState(true);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const handleAnimationFinish = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: PURCHASE_WELCOME_SPLASH_FADE_OUT_MS,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished) {
        setVisible(false);
        complete();
      }
    });
  }, [complete, opacity]);

  useEffect(() => {
    const fallbackTimer = setTimeout(
      () => {
        setVisible(false);
        complete();
      },
      UNLOCK_ANIMATION_MS + PURCHASE_WELCOME_SPLASH_FADE_OUT_MS + 250,
    );

    return () => clearTimeout(fallbackTimer);
  }, [complete]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLabel={PURCHASE_WELCOME_HEADLINE}
      accessibilityRole="progressbar"
      testID="onboarding-purchase-welcome-splash"
      style={[StyleSheet.absoluteFill, { opacity, zIndex: 100 }]}
    >
      <NewYouUnlockSplash onFinish={handleAnimationFinish} />
    </Animated.View>
  );
}
