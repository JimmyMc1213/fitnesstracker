import { PURCHASE_WELCOME_HEADLINE } from "@newyouai/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";

import { OnboardingPurchaseConfirmingScreen } from "@/components/onboarding/OnboardingPurchaseConfirmingScreen";
import NewYouUnlockSplash from "@/components/onboarding/NewYouUnlockSplash";
import {
  PURCHASE_CONFIRMING_CHECKMARK_MS,
  PURCHASE_CONFIRMING_MIN_MS,
  PURCHASE_CONFIRMING_TO_UNLOCK_MS,
  PURCHASE_WELCOME_SPLASH_FADE_OUT_MS,
} from "@/lib/splashTiming";

const UNLOCK_ANIMATION_MS = 2700 + 160;
const UNLOCK_BACKDROP = "#08070a";

type Props = {
  /** Flips true once RevenueCat / stub purchase resolves successfully. */
  purchaseComplete: boolean;
  onComplete: () => void;
};

export function OnboardingPurchaseWelcomeSplash({ purchaseComplete, onComplete }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const confirmingOpacity = useRef(new Animated.Value(1)).current;
  const completedRef = useRef(false);
  const startedAtRef = useRef(Date.now());
  const [visible, setVisible] = useState(true);
  const [unlockMounted, setUnlockMounted] = useState(false);
  const [unlockActive, setUnlockActive] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const fadeOutAndComplete = useCallback(() => {
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

  const handleUnlockFinish = useCallback(() => {
    fadeOutAndComplete();
  }, [fadeOutAndComplete]);

  const beginUnlockTransition = useCallback(() => {
    setUnlockMounted(true);
    requestAnimationFrame(() => {
      Animated.timing(confirmingOpacity, {
        toValue: 0,
        duration: PURCHASE_CONFIRMING_TO_UNLOCK_MS,
        useNativeDriver: Platform.OS !== "web",
      }).start(({ finished }) => {
        if (finished) setUnlockActive(true);
      });
    });
  }, [confirmingOpacity]);

  const handleMorphComplete = useCallback(() => {
    setTimeout(beginUnlockTransition, PURCHASE_CONFIRMING_CHECKMARK_MS);
  }, [beginUnlockTransition]);

  useEffect(() => {
    if (!purchaseComplete || showCheckmark) return;

    const elapsed = Date.now() - startedAtRef.current;
    const waitMs = Math.max(0, PURCHASE_CONFIRMING_MIN_MS - elapsed);

    const timer = setTimeout(() => setShowCheckmark(true), waitMs);
    return () => clearTimeout(timer);
  }, [purchaseComplete, showCheckmark]);

  useEffect(() => {
    const fallbackTimer = setTimeout(
      () => {
        setVisible(false);
        complete();
      },
      PURCHASE_CONFIRMING_MIN_MS +
        PURCHASE_CONFIRMING_CHECKMARK_MS +
        PURCHASE_CONFIRMING_TO_UNLOCK_MS +
        UNLOCK_ANIMATION_MS +
        PURCHASE_WELCOME_SPLASH_FADE_OUT_MS +
        500,
    );

    return () => clearTimeout(fallbackTimer);
  }, [complete]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLabel={PURCHASE_WELCOME_HEADLINE}
      accessibilityRole="progressbar"
      testID="onboarding-purchase-welcome-splash"
      style={[
        StyleSheet.absoluteFill,
        { opacity, zIndex: 100, backgroundColor: unlockMounted ? UNLOCK_BACKDROP : "transparent" },
      ]}
    >
      {unlockMounted ? (
        <View style={StyleSheet.absoluteFill} pointerEvents={unlockActive ? "auto" : "none"}>
          <NewYouUnlockSplash active={unlockActive} onFinish={handleUnlockFinish} />
        </View>
      ) : null}

      <Animated.View
        pointerEvents={unlockActive ? "none" : "auto"}
        style={[StyleSheet.absoluteFill, { opacity: confirmingOpacity }]}
      >
        <OnboardingPurchaseConfirmingScreen
          confirmed={showCheckmark}
          onMorphComplete={showCheckmark ? handleMorphComplete : undefined}
        />
      </Animated.View>
    </Animated.View>
  );
}
