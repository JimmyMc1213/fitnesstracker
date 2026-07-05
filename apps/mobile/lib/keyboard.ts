import { useEffect, useMemo, useState, type RefObject } from "react";
import { Dimensions, Keyboard, Platform, useWindowDimensions, type TextInputProps, type View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

/** Scroll a ScrollView just enough to keep a field above the on-screen keyboard. */
export function scrollFieldAboveKeyboard({
  fieldRef,
  getScrollOffset,
  scrollToOffset,
  keyboardHeight,
  clearance = 12,
  bottomInset = 0,
}: {
  fieldRef: RefObject<View | null>;
  getScrollOffset: () => number;
  scrollToOffset: (offset: number) => void;
  keyboardHeight: number;
  clearance?: number;
  bottomInset?: number;
}) {
  const field = fieldRef.current;
  if (!field || keyboardHeight < KEYBOARD_OPEN_THRESHOLD) return;

  field.measureInWindow((_x, y, _width, height) => {
    if (height === 0) return;

    const windowHeight = Dimensions.get("window").height;
    const keyboardTop = windowHeight - keyboardHeight - bottomInset;
    const targetBottom = keyboardTop - clearance;
    const fieldBottom = y + height;
    if (fieldBottom <= targetBottom) return;

    scrollToOffset(getScrollOffset() + (fieldBottom - targetBottom));
  });
}
