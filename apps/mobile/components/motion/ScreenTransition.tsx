import { useEffect, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
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
};

function resolveLayerContent(
  children: ReactNode | ((layerKey: string) => ReactNode),
  layerKey: string,
): ReactNode {
  return typeof children === "function" ? children(layerKey) : children;
}

function FadeLayer({
  layer,
  style,
  onFinished,
}: {
  layer: LayerRecord;
  style?: StyleProp<ViewStyle>;
  onFinished?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(layer.phase === "enter" ? (reduceMotion ? 1 : 0) : 1);
  const translateY = useSharedValue(layer.phase === "enter" ? (reduceMotion ? 0 : 6) : 0);

  useEffect(() => {
    if (reduceMotion) {
      onFinished?.();
      return;
    }

    if (layer.phase === "enter") {
      opacity.value = withTiming(1, {
        duration: MOTION_DURATIONS.tab,
        easing: Easing.bezier(...TAB_PAGE_EASING),
      });
      translateY.value = withTiming(0, {
        duration: MOTION_DURATIONS.tab,
        easing: Easing.bezier(...TAB_PAGE_EASING),
      });
      return;
    }

    opacity.value = withTiming(0, {
      duration: MOTION_DURATIONS.tab,
      easing: Easing.bezier(...TAB_PAGE_EASING),
    });
    translateY.value = withTiming(-6, {
      duration: MOTION_DURATIONS.tab,
      easing: Easing.bezier(...TAB_PAGE_EASING),
    }, (finished) => {
      if (finished && onFinished) runOnJS(onFinished)();
    });
  }, [layer.key, layer.phase, onFinished, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.layer, style, animatedStyle]} pointerEvents={layer.phase === "exit" ? "none" : "auto"}>
      {layer.content}
    </Animated.View>
  );
}

function StackLayer({
  layer,
  style,
  onFinished,
}: {
  layer: LayerRecord;
  style?: StyleProp<ViewStyle>;
  onFinished?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const zIndex = useSharedValue(layer.direction === "forward" ? 2 : 1);

  useEffect(() => {
    if (reduceMotion || width === 0) {
      onFinished?.();
      return;
    }

    if (layer.phase === "enter") {
      const enterFrom = layer.direction === "forward" ? width : -width * 0.28;
      translateX.value = enterFrom;
      zIndex.value = layer.direction === "forward" ? 2 : 1;
      translateX.value = withTiming(0, {
        duration: MOTION_DURATIONS.onboarding,
        easing: Easing.inOut(Easing.ease),
      });
      return;
    }

    zIndex.value = layer.direction === "forward" ? 1 : 2;
    const exitTo = layer.direction === "forward" ? -width * 0.28 : width;
    translateX.value = withTiming(exitTo, {
      duration: MOTION_DURATIONS.onboarding,
      easing: Easing.inOut(Easing.ease),
    }, (finished) => {
      if (finished && onFinished) runOnJS(onFinished)();
    });
  }, [layer.direction, layer.key, layer.phase, onFinished, reduceMotion, translateX, width, zIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: zIndex.value,
  }));

  return (
    <Animated.View
      style={[styles.stackLayer, style, animatedStyle]}
      pointerEvents={layer.phase === "exit" ? "none" : "auto"}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {layer.content}
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

  const [layers, setLayers] = useState<LayerRecord[]>(() => [
    {
      key: activeKey,
      content: resolveLayerContent(children, activeKey),
      direction: "forward",
      phase: "enter",
    },
  ]);

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((layer) => layer.phase === "enter");
      if (current?.key === activeKey) {
        return prev.map((layer) =>
          layer.phase === "enter" && layer.key === activeKey
            ? { ...layer, content: resolveLayerContent(contentRef.current, activeKey) }
            : layer,
        );
      }

      const nextEnter: LayerRecord = {
        key: activeKey,
        content: resolveLayerContent(contentRef.current, activeKey),
        direction,
        phase: "enter",
      };

      if (!current) {
        pendingEnterRef.current = null;
        return [nextEnter];
      }

      const exiting: LayerRecord = { ...current, phase: "exit", direction };

      if (variant === "fade") {
        pendingEnterRef.current = nextEnter;
        return [exiting];
      }

      pendingEnterRef.current = null;
      return [exiting, nextEnter];
    });
  }, [activeKey, direction, variant]);

  const handleExitFinished = (key: string) => {
    setLayers((prev) => {
      const next = prev.filter((layer) => layer.key !== key);
      const pending = pendingEnterRef.current;
      if (pending && next.length === 0) {
        pendingEnterRef.current = null;
        return [pending];
      }
      return next;
    });
  };

  return (
    <View style={[variant === "stack" ? styles.stackContainer : styles.container, style]}>
      {layers.map((layer) => {
        const onFinished = layer.phase === "exit" ? () => handleExitFinished(layer.key) : undefined;
        const layerStyle = variant === "stack" ? StyleSheet.absoluteFill : undefined;

        if (variant === "stack") {
          return <StackLayer key={`${layer.phase}-${layer.key}`} layer={layer} style={layerStyle} onFinished={onFinished} />;
        }

        return <FadeLayer key={`${layer.phase}-${layer.key}`} layer={layer} style={layerStyle} onFinished={onFinished} />;
      })}
    </View>
  );
}

/** Subtle page-layer enter for in-screen content swaps (matches PWA `.page-transition`). */
export function PageTransition({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 8);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    opacity.value = withTiming(1, {
      duration: 240,
      easing: Easing.bezier(...PAGE_LAYER_EASING),
    });
    translateY.value = withTiming(0, {
      duration: 240,
      easing: Easing.bezier(...PAGE_LAYER_EASING),
    });
  }, [opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.layer, style, animatedStyle]}>{children}</Animated.View>;
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

export type { NavDirection };
