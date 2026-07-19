import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  rows?: number;
  showSectionHeader?: boolean;
};

function FoodSearchRowSkeleton() {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="min-w-0 flex-1 gap-2">
        <View className="h-[15px] w-[68%] rounded-md" style={{ backgroundColor: colors.border }} />
        <View className="h-3 w-[42%] rounded" style={{ backgroundColor: colors.border }} />
      </View>
      <View className="h-[18px] w-2.5 rounded" style={{ backgroundColor: colors.border }} />
    </View>
  );
}

function FoodSearchItemCardSkeleton() {
  const { colors } = useAppTheme();

  return (
    <View
      className="mb-2 overflow-hidden rounded-[14px] border px-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <FoodSearchRowSkeleton />
    </View>
  );
}

export function FoodSearchSkeletonList({ rows = 4, showSectionHeader = true }: Props) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withTiming(0.45, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Searching foods" accessibilityState={{ busy: true }}>
      <Animated.View style={pulseStyle}>
        {showSectionHeader ? (
          <View className="mb-2.5 h-[11px] w-[88px] rounded" style={{ backgroundColor: colors.border }} />
        ) : null}
        {Array.from({ length: rows }, (_, idx) => (
          <FoodSearchItemCardSkeleton key={idx} />
        ))}
      </Animated.View>
    </View>
  );
}
