import { useEffect, useRef, type ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SWIPE_START_PX = 10;
const RELEASE_DELETE_THRESHOLD = 56;

type Props = {
  children: ReactNode;
  onDelete: () => void;
  deleteLabel: string;
  disabled?: boolean;
  testID?: string;
  borderRadius?: number;
  animateCommitDelete?: boolean;
  resetKey?: string | number;
};

export function SwipeToDelete({
  children,
  onDelete,
  deleteLabel,
  disabled = false,
  testID,
  borderRadius = 8,
  animateCommitDelete = false,
  resetKey,
}: Props) {
  const offsetX = useSharedValue(0);
  const startOffset = useSharedValue(0);
  const rowWidth = useSharedValue(0);
  const removedRef = useRef(false);

  useEffect(() => {
    if (resetKey == null) return;
    offsetX.value = 0;
    removedRef.current = false;
  }, [offsetX, resetKey]);

  function handleDelete() {
    if (disabled || removedRef.current) return;
    removedRef.current = true;
    onDelete();
  }

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-SWIPE_START_PX, SWIPE_START_PX])
    .failOffsetY([-20, 20])
    .onBegin(() => {
      startOffset.value = offsetX.value;
    })
    .onUpdate((event) => {
      const next = startOffset.value + event.translationX;
      offsetX.value = Math.min(0, next);
    })
    .onEnd(() => {
      if (offsetX.value <= -RELEASE_DELETE_THRESHOLD) {
        if (animateCommitDelete && rowWidth.value > 0) {
          offsetX.value = withTiming(
            -rowWidth.value,
            { duration: 280, easing: Easing.out(Easing.cubic) },
            (finished) => {
              if (finished) runOnJS(handleDelete)();
            },
          );
          return;
        }
        runOnJS(handleDelete)();
        return;
      }

      offsetX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
    opacity: offsetX.value < 0 ? 0.92 : 1,
  }));

  const revealStyle = useAnimatedStyle(() => ({
    opacity: offsetX.value < -4 ? 1 : 0,
  }));

  return (
    <View
      testID={testID}
      className="overflow-hidden"
      style={{ borderRadius }}
      onLayout={(event) => {
        rowWidth.value = event.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        accessibilityLabel={deleteLabel}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        className="absolute inset-0"
        style={[
          {
            borderRadius,
            backgroundColor: "rgba(255, 85, 85, 0.18)",
          },
          revealStyle,
        ]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
