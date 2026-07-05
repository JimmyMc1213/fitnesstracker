import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

type Variant = "hero" | "row";

type Props = {
  value: number;
  label: string;
  unit?: string;
  variant?: Variant;
  onChange: (next: number) => void;
  /** Optional clamp/normalize applied on commit. */
  sanitize?: (n: number) => number;
};

/**
 * Inline-editable number matching the PWA fuel-plan fields.
 * - Whole visual box is tappable (Pressable forwards focus to the hidden input).
 * - Focus state animates background/border instead of a hard black box.
 */
export function EditableNumber({ value, label, unit, variant = "row", onChange, sanitize }: Props) {
  const { ob, colors } = useOnboardingTheme();
  const reduceMotion = useReducedMotion();
  const hero = variant === "hero";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<TextInput>(null);
  const focus = useSharedValue(0);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    const to = editing ? 1 : 0;
    focus.value = reduceMotion ? to : withTiming(to, { duration: 150 });
  }, [editing, reduceMotion, focus]);

  function beginEdit() {
    if (editing) {
      inputRef.current?.focus();
      return;
    }
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function commitDraft() {
    const parsed = parseInt(draft, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChange(sanitize ? sanitize(parsed) : parsed);
    } else {
      setDraft(String(value));
    }
    setEditing(false);
  }

  const animatedBox = useAnimatedStyle(() => {
    if (hero) {
      return {
        borderBottomColor: interpolateColor(focus.value, [0, 1], [TRANSPARENT, ob.inputBorder]),
      };
    }
    return {
      backgroundColor: interpolateColor(focus.value, [0, 1], [ob.inputFaint, ob.inputBg]),
      borderColor: interpolateColor(focus.value, [0, 1], [TRANSPARENT, ob.inputBorder]),
    };
  });

  const numberStyle = [
    hero ? styles.heroNumber : styles.rowNumber,
    { color: colors.textPrimary },
  ];

  return (
    <Pressable
      onPress={beginEdit}
      accessibilityLabel={`Edit ${label}`}
      accessibilityRole="button"
      hitSlop={6}
      style={styles.pressable}
    >
      <Animated.View style={[hero ? styles.heroBox : styles.rowBox, animatedBox]}>
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitDraft}
            onSubmitEditing={commitDraft}
            keyboardType="number-pad"
            returnKeyType="done"
            selectTextOnFocus
            autoFocus
            style={[numberStyle, hero ? styles.heroInput : styles.rowInput]}
          />
        ) : (
          <Text style={numberStyle} numberOfLines={1}>
            {value}
            {unit ? (
              <Text style={[hero ? styles.heroUnit : styles.rowUnit, { color: colors.textSecondary }]}>
                {" "}
                {unit}
              </Text>
            ) : null}
          </Text>
        )}
      </Animated.View>

      {!editing ? (
        <View
          style={[hero ? styles.heroPencil : styles.rowPencil, { backgroundColor: ob.inputFaint }]}
          pointerEvents="none"
        >
          <Text style={{ fontSize: hero ? 13 : 11, color: colors.textSecondary }}>✎</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroBox: {
    borderBottomWidth: 1,
    borderBottomColor: TRANSPARENT,
    paddingVertical: 2,
  },
  rowBox: {
    borderWidth: 0.5,
    borderColor: TRANSPARENT,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    minWidth: 64,
    alignItems: "flex-end",
  },
  heroNumber: {
    fontSize: 44,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 48,
    fontVariant: ["tabular-nums"],
  },
  rowNumber: {
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  heroInput: {
    minWidth: 120,
    padding: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center" as const,
      },
    }),
  },
  rowInput: {
    textAlign: "right",
    minWidth: 56,
    padding: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center" as const,
      },
    }),
  },
  heroUnit: {
    fontSize: 20,
    fontWeight: "600",
  },
  rowUnit: {
    fontSize: 13,
    fontWeight: "600",
  },
  heroPencil: {
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowPencil: {
    height: 22,
    width: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
