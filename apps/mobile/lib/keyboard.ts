import { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform, useWindowDimensions, type TextInputProps, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NUMERIC_KEYBOARD_ACCESSORY_ID = "newyou-numeric-keyboard-done";
export const KEYBOARD_OPEN_THRESHOLD = 48;

const EXERCISE_SEARCH_KEYBOARD_BOTTOM_CHROME = 12;
const EXERCISE_SEARCH_KEYBOARD_TOP_CHROME = 8;
const EXERCISE_SEARCH_PANEL_MAX_HEIGHT = 560;

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return keyboardHeight;
}

/** Stable height while filtering; shrinks above the on-screen keyboard. */
export function useExerciseSearchSheetSizing(): {
  keyboardOpen: boolean;
  panelStyle: ViewStyle;
  bodyStyle: ViewStyle;
  listStyle: ViewStyle;
} {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight >= KEYBOARD_OPEN_THRESHOLD;

  return useMemo(() => {
    const keyboardChrome = keyboardOpen
      ? insets.top + EXERCISE_SEARCH_KEYBOARD_TOP_CHROME + EXERCISE_SEARCH_KEYBOARD_BOTTOM_CHROME
      : 0;
    const panelHeight = keyboardOpen
      ? Math.max(240, windowHeight - keyboardHeight - keyboardChrome)
      : Math.min(EXERCISE_SEARCH_PANEL_MAX_HEIGHT, Math.round(windowHeight * 0.82));

    return {
      keyboardOpen,
      panelStyle: {
        padding: 0,
        height: panelHeight,
        maxHeight: panelHeight,
      },
      bodyStyle: {
        flex: 1,
        minHeight: 0,
      },
      listStyle: {
        flex: 1,
        minHeight: 0,
      },
    };
  }, [keyboardOpen, keyboardHeight, windowHeight, insets.top]);
}

export function dismissKeyboard() {
  Keyboard.dismiss();
}

export function isNumericKeyboardType(keyboardType?: TextInputProps["keyboardType"]): boolean {
  return keyboardType === "number-pad" || keyboardType === "decimal-pad" || keyboardType === "numeric";
}

/** Attach to TextInput when using a pad keyboard on iOS so users can dismiss it. */
export function numericKeyboardAccessoryProps(
  keyboardType?: TextInputProps["keyboardType"],
): Pick<TextInputProps, "inputAccessoryViewID"> {
  if (Platform.OS !== "ios" || !isNumericKeyboardType(keyboardType)) return {};
  return { inputAccessoryViewID: NUMERIC_KEYBOARD_ACCESSORY_ID };
}
