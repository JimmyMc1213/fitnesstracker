import type { WeightUnit } from "@newyouai/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { formatWeightFromLbs, parseWeightToLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";

const TICK_WIDTH = 10;
const TRACK_HEIGHT = 72;
const INDICATOR_HEIGHT = 52;

function displayStep(unit: WeightUnit): number {
  return unit === "kg" ? 0.1 : 0.5;
}

function stepLbs(unit: WeightUnit): number {
  return parseWeightToLbs(displayStep(unit), unit);
}

function clampLbs(value: number, minLbs: number, maxLbs: number): number {
  return Math.min(maxLbs, Math.max(minLbs, value));
}

function indexForLbs(valueLbs: number, minLbs: number, unit: WeightUnit): number {
  return Math.round((valueLbs - minLbs) / stepLbs(unit));
}

function lbsForIndex(index: number, minLbs: number, unit: WeightUnit): number {
  return minLbs + index * stepLbs(unit);
}

function tickHeight(index: number, majorEvery: number): number {
  if (index % majorEvery === 0) return 36;
  if (index % (majorEvery / 2) === 0) return 24;
  return 14;
}

function rulerColors(scheme: "light" | "dark") {
  if (scheme === "light") {
    return { indicator: "#000000", tick: "rgba(0, 0, 0, 0.18)" };
  }
  return { indicator: "#ffffff", tick: "rgba(255, 255, 255, 0.28)" };
}

export function WeightRulerPicker({
  valueLbs,
  onChange,
  minLbs,
  maxLbs,
  unit,
  directionLabel,
  testID = "onboarding-weight-ruler",
}: {
  valueLbs: number;
  onChange: (lbs: number) => void;
  minLbs: number;
  maxLbs: number;
  unit: WeightUnit;
  directionLabel: string;
  testID?: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollLeftRef = useRef(0);
  const syncingRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const { ob, scheme, colors } = useOnboardingTheme();
  const ruler = rulerColors(scheme);

  const majorEvery = unit === "kg" ? 10 : 2;
  const tickCount = useMemo(() => {
    const count = Math.round((maxLbs - minLbs) / stepLbs(unit)) + 1;
    return Math.max(2, count);
  }, [maxLbs, minLbs, unit]);

  const sidePad = Math.max(0, viewportWidth / 2);
  const trackWidth = tickCount * TICK_WIDTH;
  const displayValue = formatWeightFromLbs(valueLbs, unit, 1);
  const unitLabel = weightUnitLabel(unit);

  const scrollToIndex = useCallback(
    (index: number, animated = false) => {
      if (!scrollRef.current || viewportWidth <= 0) return;
      const clamped = Math.min(tickCount - 1, Math.max(0, index));
      const target = sidePad + clamped * TICK_WIDTH - viewportWidth / 2;
      syncingRef.current = true;
      scrollRef.current.scrollTo({ x: Math.max(0, target), animated });
      scrollLeftRef.current = Math.max(0, target);
      const releaseSync = () => {
        syncingRef.current = false;
      };
      if (animated) {
        setTimeout(releaseSync, 280);
      } else {
        requestAnimationFrame(releaseSync);
      }
    },
    [sidePad, tickCount, viewportWidth],
  );

  const updateFromOffset = useCallback(
    (offsetX: number) => {
      if (syncingRef.current || viewportWidth <= 0) return;
      const center = offsetX + viewportWidth / 2;
      const rawIndex = Math.round((center - sidePad) / TICK_WIDTH);
      const nextLbs = clampLbs(lbsForIndex(rawIndex, minLbs, unit), minLbs, maxLbs);
      if (Math.abs(nextLbs - valueLbs) > 0.01) onChange(nextLbs);
    },
    [viewportWidth, sidePad, minLbs, maxLbs, unit, valueLbs, onChange],
  );

  const snapFromOffset = useCallback(
    (offsetX: number) => {
      if (viewportWidth <= 0) return;
      const center = offsetX + viewportWidth / 2;
      const index = Math.round((center - sidePad) / TICK_WIDTH);
      scrollToIndex(index, true);
      updateFromOffset(offsetX);
    },
    [viewportWidth, sidePad, scrollToIndex, updateFromOffset],
  );

  useEffect(() => {
    if (viewportWidth <= 0) return;
    const idx = indexForLbs(valueLbs, minLbs, unit);
    const currentIdx = Math.round((scrollLeftRef.current + viewportWidth / 2 - sidePad) / TICK_WIDTH);
    if (currentIdx !== idx) scrollToIndex(idx);
  }, [valueLbs, minLbs, maxLbs, unit, viewportWidth, sidePad, scrollToIndex]);

  function onStageLayout(event: LayoutChangeEvent) {
    setViewportWidth(event.nativeEvent.layout.width);
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollLeftRef.current = event.nativeEvent.contentOffset.x;
    updateFromOffset(event.nativeEvent.contentOffset.x);
  }

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    snapFromOffset(event.nativeEvent.contentOffset.x);
  }

  return (
    <View testID={testID} style={styles.root}>
      <Text style={[styles.direction, { color: ob.helper }]}>{directionLabel}</Text>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.value, { color: ob.headline }]}
      >
        {displayValue} {unitLabel}
      </Text>

      <View style={styles.stage} onLayout={onStageLayout}>
        <View
          pointerEvents="none"
          style={[styles.indicator, { backgroundColor: ruler.indicator }]}
        />
        <View
          pointerEvents="none"
          style={[styles.fadeRight, { backgroundColor: colors.background }]}
        />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="fast"
          onScroll={onScroll}
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: sidePad }}
        >
          <View style={[styles.track, { width: trackWidth }]}>
            {Array.from({ length: tickCount }, (_, index) => (
              <View key={index} style={[styles.tickWrap, { width: TICK_WIDTH }]}>
                <View
                  style={[
                    styles.tick,
                    {
                      height: tickHeight(index, majorEvery),
                      backgroundColor: ruler.tick,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    paddingVertical: 12,
  },
  direction: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    marginBottom: 36,
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  stage: {
    position: "relative",
    width: "100%",
  },
  indicator: {
    position: "absolute",
    top: 8,
    left: "50%",
    zIndex: 2,
    width: 2,
    height: INDICATOR_HEIGHT,
    marginLeft: -1,
    borderRadius: 999,
  },
  fadeRight: {
    position: "absolute",
    top: 8,
    left: "50%",
    zIndex: 1,
    width: "52%",
    height: INDICATOR_HEIGHT,
    marginLeft: 8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  track: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: TRACK_HEIGHT,
    paddingVertical: 8,
  },
  tickWrap: {
    height: TRACK_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tick: {
    width: 1.5,
    borderRadius: 999,
  },
});
