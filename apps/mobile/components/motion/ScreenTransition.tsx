/**
 * Drop-in Reanimated motion layer. Matches PWA motion.tsx:
 *
 *   fade   → opacity 0→1 + y 6→0 in 180ms  (tabs)
 *   stack  → x 100%→0 / -28%→0 in 250ms    (onboarding, wizard flows)
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  MOTION_DURATIONS,
  PAGE_LAYER_EASING,
  TAB_PAGE_EASING,
  type NavDirection,
} from "./tokens";
import { useReducedMotion } from "./useReducedMotion";

export type { NavDirection };

type ScreenTransitionProps = {
  activeKey: string;
  variant?: "fade" | "stack";
  direction?: NavDirection;
  style?: StyleProp<ViewStyle>;
  children: ReactNode | ((layerKey: string) => ReactNode);
};

type LayerRecord = {
  key: string;
  content: ReactNode;
  direction: NavDirection;
  phase: "enter" | "exit";
  generation: number;
};

function resolveContent(
  children: ReactNode | ((key: string) => ReactNode),
  key: string,
): ReactNode {
  return typeof children === "function" ? children(key) : children;
}

/** Active enter layers use live children; exit layers keep the content captured at transition time. */
function resolveLayerContent(
  layer: LayerRecord,
  activeKey: string,
  children: ReactNode | ((key: string) => ReactNode),
): ReactNode {
  if (layer.phase === "exit") {
    return layer.content;
  }
  if (typeof children === "function") {
    return children(layer.key);
  }
  if (layer.key === activeKey) {
    return children;
  }
  return layer.content;
}

function safeTimeout(cb: () => void, ms: number) {
  const id = setTimeout(cb, ms);
  return () => clearTimeout(id);
}

function FadeLayer({
  layer,
  content,
  style,
  onFinished,
}: {
  layer: LayerRecord;
  content: ReactNode;
  style?: StyleProp<ViewStyle>;
  onFinished?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 1 : 180;

  const opacity = useSharedValue(layer.phase === "enter" ? (reduceMotion ? 1 : 0) : 1);
  const translateY = useSharedValue(layer.phase === "enter" ? (reduceMotion ? 0 : 6) : 0);

  useEffect(() => {
    if (reduceMotion) {
      onFinished?.();
      return;
    }

    const easing = Easing.bezier(...TAB_PAGE_EASING);

    if (layer.phase === "enter") {
      opacity.value = withTiming(1, { duration, easing });
      translateY.value = withTiming(0, { duration, easing });
      return;
    }

    opacity.value = withTiming(0, { duration, easing });
    translateY.value = withTiming(-6, { duration, easing }, (finished) => {
      if (finished && onFinished) runOnJS(onFinished)();
    });

    return safeTimeout(() => onFinished?.(), duration + 80);
  }, [layer.key, layer.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.layer, style, animatedStyle]}
      pointerEvents={layer.phase === "exit" ? "none" : "auto"}
    >
      {content}
    </Animated.View>
  );
}

function StackLayer({
  layer,
  content,
  style,
  onFinished,
}: {
  layer: LayerRecord;
  content: ReactNode;
  style?: StyleProp<ViewStyle>;
  onFinished?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  // Compute starting position at mount so frame 0 is already correct — no snap/flash.
  // layer props are stable for this component's lifetime (generation counter ensures unique mounts).
  const initialX = reduceMotion
    ? 0
    : layer.phase === "enter"
      ? layer.direction === "forward"
        ? width
        : -width * 0.28
      : 0;

  // forward: entering=2/exiting=1 (new screen slides over old)
  // back:    entering=1/exiting=2 (old screen slides away over new)
  const layerZIndex =
    layer.direction === "forward"
      ? layer.phase === "enter" ? 2 : 1
      : layer.phase === "enter" ? 1 : 2;

  const translateX = useSharedValue(initialX);

  useEffect(() => {
    if (reduceMotion) {
      if (layer.phase === "exit") onFinished?.();
      return;
    }

    const duration = MOTION_DURATIONS.onboarding;
    // cubicBezier(0.42,0,0.58,1) = CSS ease-in-out, matches PWA "easeInOut"
    const easing = Easing.bezier(0.42, 0, 0.58, 1);

    if (layer.phase === "enter") {
      translateX.value = withTiming(0, { duration, easing });
      return;
    }

    const to = layer.direction === "forward" ? -width * 0.28 : width;
    translateX.value = withTiming(to, { duration, easing }, (finished) => {
      if (finished && onFinished) runOnJS(onFinished)();
    });

    return safeTimeout(() => onFinished?.(), duration + 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[styles.stackLayer, { zIndex: layerZIndex }, style, animatedStyle]}
      pointerEvents={layer.phase === "exit" ? "none" : "auto"}
    >
      {content}
    </Animated.View>
  );
}

export function ScreenTransition({
  activeKey,
  variant = "fade",
  direction = "forward",
  style,
  children,
}: ScreenTransitionProps) {
  const contentRef = useRef(children);
  contentRef.current = children;
  const pendingEnterRef = useRef<LayerRecord | null>(null);
  const generationRef = useRef(0);

  const [layers, setLayers] = useState<LayerRecord[]>(() => [
    {
      key: activeKey,
      content: resolveContent(children, activeKey),
      direction: "forward",
      phase: "enter",
      generation: 0,
    },
  ]);

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((l) => l.phase === "enter");

      if (current?.key === activeKey) {
        return [{ ...current, content: resolveContent(contentRef.current, activeKey) }];
      }

      const nextEnter: LayerRecord = {
        key: activeKey,
        content: resolveContent(contentRef.current, activeKey),
        direction,
        phase: "enter",
        generation: ++generationRef.current,
      };

      if (!current) {
        pendingEnterRef.current = null;
        return [nextEnter];
      }

      // current.content is kept live while the layer is the active enter layer (see
      // the early-return branch above). Spreading it here freezes the old step's UI
      // so the exit animation shows the right screen, not the new step's content.
      const exiting: LayerRecord = { ...current, phase: "exit", direction };

      if (variant === "fade") {
        pendingEnterRef.current = nextEnter;
        return [exiting];
      }

      pendingEnterRef.current = null;
      return [exiting, nextEnter];
    });
  }, [activeKey, direction, variant]);

  const handleExitFinished = (key: string, generation: number) => {
    setLayers((prev) => {
      const next = prev.filter(
        (l) => !(l.key === key && l.generation === generation && l.phase === "exit"),
      );
      const pending = pendingEnterRef.current;
      if (pending && next.length === 0) {
        pendingEnterRef.current = null;
        return [pending];
      }
      return next;
    });
  };

  const isStack = variant === "stack";

  return (
    <View style={[isStack ? styles.stackContainer : styles.container, style]}>
      {layers.map((layer) => {
        const onFinished =
          layer.phase === "exit"
            ? () => handleExitFinished(layer.key, layer.generation)
            : undefined;
        const content = resolveLayerContent(layer, activeKey, contentRef.current);

        if (isStack) {
          return (
            <StackLayer
              key={`${layer.phase}-${layer.key}-${layer.generation}`}
              layer={layer}
              content={content}
              style={StyleSheet.absoluteFill}
              onFinished={onFinished}
            />
          );
        }

        return (
          <FadeLayer
            key={`${layer.phase}-${layer.key}-${layer.generation}`}
            layer={layer}
            content={content}
            onFinished={onFinished}
          />
        );
      })}
    </View>
  );
}

/** Subtle page-layer enter for in-screen content swaps (matches PWA `.page-transition`). */
export function PageTransition({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 8);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const easing = Easing.bezier(...PAGE_LAYER_EASING);
    opacity.value = withTiming(1, { duration: 240, easing });
    translateY.value = withTiming(0, { duration: 240, easing });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.layer, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

/** Staggered reveal inside onboarding stack layers (matches PWA headline/helper). */
export function OnboardingContentReveal({
  children,
  delay = 70,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 10);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const easing = Easing.bezier(...PAGE_LAYER_EASING);
    const id = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 420, easing });
      translateY.value = withTiming(0, { duration: 420, easing });
    }, delay);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  stackContainer: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    position: "relative",
  },
  layer: {
    flex: 1,
    minHeight: 0,
  },
  stackLayer: {
    ...StyleSheet.absoluteFill,
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
});
