import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

import { useAppTheme } from "@/hooks/useAppTheme";

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_VISIBLE_ITEMS = 5;
export const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS;
export const WHEEL_CENTER_OFFSET = Math.floor(WHEEL_VISIBLE_ITEMS / 2) * WHEEL_ITEM_HEIGHT;

const SPRING = { damping: 28, stiffness: 280, mass: 0.8 };

export type WheelPickerAppearance = "default" | "inline";

export function wheelPickerColors(
  scheme: "light" | "dark",
  background: string,
  appearance: WheelPickerAppearance = "default",
) {
  if (appearance === "inline") {
    if (scheme === "light") {
      return {
        fade: background,
        highlightBg: "rgba(120, 120, 128, 0.16)",
        highlightBorder: "transparent",
        selected: "#000000",
        muted: "rgba(60, 60, 67, 0.32)",
        labelSize: 20,
      };
    }
    return {
      fade: background,
      highlightBg: "rgba(255, 255, 255, 0.1)",
      highlightBorder: "transparent",
      selected: "#ffffff",
      muted: "rgba(255, 255, 255, 0.28)",
      labelSize: 20,
    };
  }

  if (scheme === "light") {
    return {
      fade: background,
      highlightBg: "rgba(118, 118, 128, 0.12)",
      highlightBorder: "rgba(60, 60, 67, 0.12)",
      selected: "#000000",
      muted: "rgba(60, 60, 67, 0.45)",
      labelSize: 16,
    };
  }
  return {
    fade: background,
    highlightBg: "rgba(255, 255, 255, 0.08)",
    highlightBorder: "rgba(255, 255, 255, 0.14)",
    selected: "#ffffff",
    muted: "rgba(255, 255, 255, 0.34)",
    labelSize: 16,
  };
}

type WheelColors = ReturnType<typeof wheelPickerColors>;

type WheelItemProps = {
  label: string | number;
  index: number;
  translateY: SharedValue<number>;
  selected: boolean;
  colors: WheelColors;
};

function WheelItem({ label, index, translateY, selected, colors }: WheelItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * WHEEL_ITEM_HEIGHT + translateY.value + WHEEL_CENTER_OFFSET;
    const opacity = interpolate(
      itemY,
      [0, WHEEL_CENTER_OFFSET * 0.55, WHEEL_CENTER_OFFSET, WHEEL_CENTER_OFFSET * 1.45, WHEEL_HEIGHT],
      [0.25, 0.55, 1, 0.55, 0.25],
      "clamp",
    );
    const scale = interpolate(
      itemY,
      [0, WHEEL_CENTER_OFFSET, WHEEL_HEIGHT],
      [0.82, 1, 0.82],
      "clamp",
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[wheelStyles.item, animatedStyle]}>
      <Text
        style={[
          wheelStyles.label,
          {
            fontSize: colors.labelSize,
            color: selected ? colors.selected : colors.muted,
            fontWeight: selected ? "600" : "400",
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export type WheelPickerColumnProps = {
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  flex?: number;
  colors: WheelColors;
  highlightSelection?: boolean;
};

export function WheelPickerColumn({
  items,
  selectedIndex,
  onSelect,
  flex = 1,
  colors,
  highlightSelection = true,
}: WheelPickerColumnProps) {
  const translateY = useSharedValue(-selectedIndex * WHEEL_ITEM_HEIGHT);
  const dragStart = useSharedValue(0);
  const itemCount = useSharedValue(items.length);
  const itemCountRef = useRef(items.length);
  const selectedRef = useRef(selectedIndex);
  const onSelectRef = useRef(onSelect);

  selectedRef.current = selectedIndex;
  onSelectRef.current = onSelect;

  useEffect(() => {
    itemCount.value = items.length;
    itemCountRef.current = items.length;
  }, [itemCount, items.length]);

  const snapToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, itemCountRef.current - 1));
    if (clamped !== selectedRef.current) {
      onSelectRef.current(clamped);
    }
  }, []);

  useEffect(() => {
    translateY.value = withSpring(-selectedIndex * WHEEL_ITEM_HEIGHT, SPRING);
  }, [selectedIndex, translateY]);

  const pan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .failOffsetX([-12, 12])
    .onBegin(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = dragStart.value + event.translationY;
      const minY = -(itemCount.value - 1) * WHEEL_ITEM_HEIGHT;
      translateY.value = Math.max(minY, Math.min(0, next));
    })
    .onEnd((event) => {
      const projected = translateY.value + event.velocityY * 0.08;
      const index = Math.round(-projected / WHEEL_ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(itemCount.value - 1, index));
      translateY.value = withSpring(-clamped * WHEEL_ITEM_HEIGHT, SPRING);
      runOnJS(snapToIndex)(clamped);
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[wheelStyles.column, { flex }]}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[wheelStyles.track, trackStyle]}>
          {items.map((item, index) => (
            <WheelItem
              key={`${item}-${index}`}
              label={item}
              index={index}
              translateY={translateY}
              selected={highlightSelection && index === selectedIndex}
              colors={colors}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function FadeMask({ edge, color }: { edge: "top" | "bottom"; color: string }) {
  const steps = [0.95, 0.72, 0.48, 0.24, 0];
  return (
    <View pointerEvents="none" style={[wheelStyles.fadeMask, edge === "top" ? wheelStyles.fadeTop : wheelStyles.fadeBottom]}>
      {steps.map((opacity, index) => (
        <View
          key={`${edge}-${index}`}
          style={{
            flex: 1,
            backgroundColor: color,
            opacity,
          }}
        />
      ))}
    </View>
  );
}

export function WheelPickerFrame({
  children,
  colors,
  appearance = "default",
}: {
  children: ReactNode;
  colors: WheelColors;
  appearance?: WheelPickerAppearance;
}) {
  return (
    <View style={[wheelStyles.root, appearance === "inline" && wheelStyles.rootInline]}>
      <View
        style={[
          wheelStyles.highlight,
          appearance === "inline" && wheelStyles.highlightInline,
          { backgroundColor: colors.highlightBg, borderColor: colors.highlightBorder },
        ]}
      />
      <FadeMask edge="top" color={colors.fade} />
      <FadeMask edge="bottom" color={colors.fade} />
      {children}
    </View>
  );
}

export function useWheelPickerColors(
  appearance: WheelPickerAppearance = "default",
  fadeColor?: string,
) {
  const { scheme, colors: appColors } = useAppTheme();
  const fade = fadeColor ?? appColors.background;
  return wheelPickerColors(scheme, fade, appearance);
}

const wheelStyles = StyleSheet.create({
  root: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 320,
    height: WHEEL_HEIGHT,
    alignSelf: "center",
    overflow: "hidden",
  },
  rootInline: {
    maxWidth: "100%",
  },
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: WHEEL_CENTER_OFFSET,
    height: WHEEL_ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  highlightInline: {
    left: 4,
    right: 4,
    borderRadius: 8,
    borderWidth: 0,
  },
  fadeMask: {
    position: "absolute",
    left: 0,
    right: 0,
    height: WHEEL_CENTER_OFFSET,
    zIndex: 2,
    flexDirection: "column",
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
  column: {
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    zIndex: 3,
  },
  track: {
    paddingTop: WHEEL_CENTER_OFFSET,
    paddingBottom: WHEEL_CENTER_OFFSET,
  },
  item: {
    height: WHEEL_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
