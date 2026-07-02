import { Keyboard, Platform, type TextInputProps } from "react-native";

export const NUMERIC_KEYBOARD_ACCESSORY_ID = "newyou-numeric-keyboard-done";

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
