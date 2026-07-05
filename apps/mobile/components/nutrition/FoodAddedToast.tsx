import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useAppTheme } from "@/hooks/useAppTheme";

const TOAST_DURATION_MS = 5000;

export function useFoodAddedToast(durationMs = TOAST_DURATION_MS) {
  const [visible, setVisible] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    setVisible(false);
    setItemId(null);
  }, []);

  const show = useCallback(
    (loggedItemId: string) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      setItemId(loggedItemId);
      setVisible(true);
      timerRef.current = setTimeout(hide, durationMs);
    },
    [durationMs, hide],
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  return { visible, itemId, show, hide };
}

type Props = {
  visible: boolean;
  message?: string;
  testID?: string;
  undoTestID?: string;
  onView?: () => void;
  onUndo?: () => void;
};

export function FoodAddedToast({
  visible,
  message = "Food added",
  testID = "food-added-toast",
  undoTestID = "food-added-toast-undo",
  onView,
  onUndo,
}: Props) {
  const { colors } = useAppTheme();

  if (!visible) return null;

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      className="mb-3 flex-row items-center justify-between gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
        {message}
      </Text>
      <View className="flex-row items-center gap-4">
        {onView ? (
          <Pressable onPress={onView} accessibilityRole="button">
            <Text className="text-sm font-semibold" style={{ color: colors.accent }}>
              View
            </Text>
          </Pressable>
        ) : null}
        {onUndo ? (
          <Pressable onPress={onUndo} accessibilityRole="button" testID={undoTestID}>
            <Text className="text-sm font-semibold" style={{ color: "#4ade80" }}>
              Undo
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
