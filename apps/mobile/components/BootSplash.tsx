import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet } from "react-native";

import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BOOT_SPLASH_FADE_OUT_MS, BOOT_SPLASH_MIN_VISIBLE_MS } from "@/lib/splashTiming";

type BootSplashProps = {
  onComplete: () => void;
};

export function BootSplash({ onComplete }: BootSplashProps) {
  const { colors } = useAppTheme();
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
        duration: BOOT_SPLASH_FADE_OUT_MS,
        useNativeDriver: Platform.OS !== "web",
      }).start(({ finished }) => {
        if (finished) complete();
      });
    }, BOOT_SPLASH_MIN_VISIBLE_MS);

    const fallbackTimer = setTimeout(
      complete,
      BOOT_SPLASH_MIN_VISIBLE_MS + BOOT_SPLASH_FADE_OUT_MS + 250,
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete, opacity]);

  return (
    <Animated.View
      accessibilityLabel="Loading NewYou"
      accessibilityRole="progressbar"
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity, zIndex: 50, backgroundColor: colors.background }]}
      className="items-center justify-center"
      testID="boot-splash"
    >
      <NewYouSplashMark />
    </Animated.View>
  );
}
