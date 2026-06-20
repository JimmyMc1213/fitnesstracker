import { PURCHASE_WELCOME_HEADLINE, PURCHASE_WELCOME_SPLASH_THEME } from "@newyouai/core";
import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfettiBurst } from "@/components/motion";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import {
  PURCHASE_WELCOME_SPLASH_FADE_OUT_MS,
  PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS,
} from "@/lib/splashTiming";

type Props = {
  onComplete: () => void;
};

export function OnboardingPurchaseWelcomeSplash({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(1)).current;
  const completedRef = useRef(false);

  useEffect(() => {
    const complete = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    };

    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: PURCHASE_WELCOME_SPLASH_FADE_OUT_MS,
        useNativeDriver: Platform.OS !== "web",
      }).start(({ finished }) => {
        if (finished) complete();
      });
    }, PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS);

    const fallbackTimer = setTimeout(
      complete,
      PURCHASE_WELCOME_SPLASH_MIN_VISIBLE_MS + PURCHASE_WELCOME_SPLASH_FADE_OUT_MS + 250,
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete, opacity]);

  return (
    <Animated.View
      accessibilityLabel={PURCHASE_WELCOME_HEADLINE}
      accessibilityRole="progressbar"
      testID="onboarding-purchase-welcome-splash"
      style={[
        StyleSheet.absoluteFill,
        {
          opacity,
          zIndex: 100,
          backgroundColor: PURCHASE_WELCOME_SPLASH_THEME.background,
        },
      ]}
      className="items-center justify-center"
    >
      <View
        style={{
          alignItems: "center",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 24,
          gap: 20,
        }}
      >
        <NewYouSplashMark
          iconOnly
          logoBackgroundColor={PURCHASE_WELCOME_SPLASH_THEME.gold}
          logoIconColor={PURCHASE_WELCOME_SPLASH_THEME.goldOn}
        />
        <Text
          className="text-center text-[28px] font-bold tracking-tight"
          style={{ color: PURCHASE_WELCOME_SPLASH_THEME.gold, letterSpacing: -0.5 }}
        >
          {PURCHASE_WELCOME_HEADLINE}
        </Text>
      </View>
      <ConfettiBurst />
    </Animated.View>
  );
}
