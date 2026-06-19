import { useCallback, useEffect, useMemo, useRef } from "react";
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

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

const SPRING = { damping: 28, stiffness: 280, mass: 0.8 };

function wheelColors(scheme: "light" | "dark", background: string) {
  if (scheme === "light") {
    return {
      fade: background,
      highlightBg: "rgba(118, 118, 128, 0.12)",
      highlightBorder: "rgba(60, 60, 67, 0.12)",
      selected: "#000000",
      muted: "rgba(60, 60, 67, 0.45)",
    };
  }
  return {
    fade: background,
    highlightBg: "rgba(255, 255, 255, 0.08)",
    highlightBorder: "rgba(255, 255, 255, 0.14)",
    selected: "#ffffff",
    muted: "rgba(255, 255, 255, 0.34)",
  };
}

type WheelItemProps = {
  label: string | number;
  index: number;
  translateY: SharedValue<number>;
  selected: boolean;
  colors: ReturnType<typeof wheelColors>;
};

function WheelItem({ label, index, translateY, selected, colors }: WheelItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT + translateY.get() + CENTER_OFFSET;
    const opacity = interpolate(
      itemY,
      [0, CENTER_OFFSET * 0.55, CENTER_OFFSET, CENTER_OFFSET * 1.45, WHEEL_HEIGHT],
      [0.25, 0.55, 1, 0.55, 0.25],
      "clamp",
    );
    const scale = interpolate(
      itemY,
      [0, CENTER_OFFSET, WHEEL_HEIGHT],
      [0.82, 1, 0.82],
      "clamp",
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
      <Text
        style={[
          styles.label,
          { color: selected ? colors.selected : colors.muted, fontWeight: selected ? "600" : "400" },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

type WheelColumnProps = {
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  flex: number;
  colors: ReturnType<typeof wheelColors>;
  highlightSelection: boolean;
};

function WheelColumn({ items, selectedIndex, onSelect, flex, colors, highlightSelection }: WheelColumnProps) {
  const translateY = useSharedValue(-selectedIndex * ITEM_HEIGHT);
  const dragStart = useSharedValue(0);
  const selectedRef = useRef(selectedIndex);
  const onSelectRef = useRef(onSelect);
  const countRef = useRef(items.length);

  selectedRef.current = selectedIndex;
  onSelectRef.current = onSelect;
  countRef.current = items.length;

  const snapToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, countRef.current - 1));
    if (clamped !== selectedRef.current) {
      onSelectRef.current(clamped);
    }
  }, []);

  useEffect(() => {
    translateY.value = withSpring(-selectedIndex * ITEM_HEIGHT, SPRING);
  }, [selectedIndex, translateY]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = dragStart.value + event.translationY;
      const minY = -(countRef.current - 1) * ITEM_HEIGHT;
      translateY.value = Math.max(minY, Math.min(0, next));
    })
    .onEnd((event) => {
      const projected = translateY.value + event.velocityY * 0.08;
      const index = Math.round(-projected / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(countRef.current - 1, index));
      translateY.value = withSpring(-clamped * ITEM_HEIGHT, SPRING);
      runOnJS(snapToIndex)(clamped);
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.column, { flex }]}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.track, trackStyle]}>
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
    <View pointerEvents="none" style={[styles.fadeMask, edge === "top" ? styles.fadeTop : styles.fadeBottom]}>
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

export type DateWheelPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  minYear: number;
  maxYear: number;
  /** When false, the wheel scrolls but no row is styled as selected until the parent commits a value. */
  highlightSelection?: boolean;
};

function getMonthNames(): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }),
  );
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DateWheelPicker({
  value,
  onChange,
  minYear,
  maxYear,
  highlightSelection = true,
}: DateWheelPickerProps) {
  const { scheme, colors: appColors } = useAppTheme();
  const wheel = useMemo(() => wheelColors(scheme, appColors.background), [scheme, appColors.background]);

  const months = useMemo(() => getMonthNames(), []);
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      arr.push(year);
    }
    return arr;
  }, [minYear, maxYear]);

  const month = value.getMonth();
  const day = value.getDate();
  const year = value.getFullYear();

  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month],
  );

  const yearIndex = Math.max(0, years.indexOf(year));
  const dayIndex = Math.max(0, Math.min(day - 1, days.length - 1));

  const emit = useCallback(
    (nextYear: number, nextMonth: number, nextDay: number) => {
      const maxDay = daysInMonth(nextYear, nextMonth);
      const safeDay = Math.min(nextDay, maxDay);
      onChange(new Date(nextYear, nextMonth, safeDay));
    },
    [onChange],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.highlight, { backgroundColor: wheel.highlightBg, borderColor: wheel.highlightBorder }]} />
      <FadeMask edge="top" color={wheel.fade} />
      <FadeMask edge="bottom" color={wheel.fade} />

      <WheelColumn
        items={months}
        selectedIndex={month}
        flex={1.35}
        colors={wheel}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(year, index, day)}
      />
      <WheelColumn
        items={days}
        selectedIndex={dayIndex}
        flex={0.75}
        colors={wheel}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(year, month, days[index] as number)}
      />
      <WheelColumn
        items={years}
        selectedIndex={yearIndex}
        flex={0.9}
        colors={wheel}
        highlightSelection={highlightSelection}
        onSelect={(index) => emit(years[index] as number, month, day)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  highlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: CENTER_OFFSET,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  fadeMask: {
    position: "absolute",
    left: 0,
    right: 0,
    height: CENTER_OFFSET,
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
    paddingTop: CENTER_OFFSET,
    paddingBottom: CENTER_OFFSET,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
