import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useRef, type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from "react";
import { dismissKeyboard, numericKeyboardAccessoryProps } from "@/lib/keyboard";

export type AlignedTextInputSize = "field" | "sheet" | "onboarding" | "auth" | "compact" | "dense";

const SIZE_PRESETS = {
  field: {
    height: 48,
    fontSize: 15,
    fontWeight: "500" as const,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  sheet: {
    height: 48,
    fontSize: 18,
    fontWeight: "600" as const,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  onboarding: {
    height: 56,
    fontSize: 18,
    fontWeight: "400" as const,
    borderRadius: 16,
    paddingHorizontal: 24,
    borderWidth: 1.5,
  },
  auth: {
    height: 52,
    fontSize: 16,
    fontWeight: "400" as const,
    borderRadius: 9999,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  compact: {
    height: 44,
    fontSize: 15,
    fontWeight: "500" as const,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  dense: {
    height: 40,
    fontSize: 13,
    fontWeight: "500" as const,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
} as const;

export type AlignedTextInputShellStyle = Pick<
  ViewStyle,
  | "borderColor"
  | "backgroundColor"
  | "borderWidth"
  | "paddingLeft"
  | "paddingRight"
  | "paddingHorizontal"
  | "marginTop"
  | "marginBottom"
>;

type Props = TextInputProps & {
  size?: AlignedTextInputSize;
  shellStyle?: AlignedTextInputShellStyle;
  inputStyle?: { color: string; fontWeight?: "400" | "500" | "600" | "700" };
  /** Use when the input sits inside an existing bordered container. */
  inline?: boolean;
  /** Minimum height for multiline fields (default 96). */
  multilineMinHeight?: number;
  /** Ignored — styling is owned by the aligned shell. */
  className?: string;
};

/** Core TextInput styles for borderless fields (titles, inline rows). */
export function coreAlignedInputStyle(fontSize: number, multiline = false): TextStyle {
  return {
    padding: 0,
    margin: 0,
    fontSize,
    ...(multiline
      ? { textAlignVertical: "top" as const }
      : Platform.select({
          ios: { height: fontSize + 2 },
          android: {
            paddingVertical: 0,
            textAlignVertical: "center" as const,
            includeFontPadding: false,
          },
        })),
  };
}

/** TextInput wrapped in a fixed-height shell so typed text aligns with the caret on iOS and Android. */
export function AlignedTextInput({
  size = "field",
  shellStyle,
  inputStyle,
  inline = false,
  multilineMinHeight = 96,
  style,
  multiline,
  className: _className,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  keyboardType,
  inputAccessoryViewID,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: Props) {
  const preset = SIZE_PRESETS[size];
  const color = inputStyle?.color;
  const fontWeight = inputStyle?.fontWeight ?? preset.fontWeight;
  const inputRef = useRef<TextInput>(null);
  const shellAccessible = testID != null || accessibilityLabel != null;

  const resolvedReturnKeyType = returnKeyType ?? (multiline ? "default" : "done");
  const resolvedBlurOnSubmit = blurOnSubmit ?? !multiline;
  const resolvedAccessoryProps = {
    ...numericKeyboardAccessoryProps(keyboardType),
    ...(inputAccessoryViewID ? { inputAccessoryViewID } : {}),
  };

  function handleSubmitEditing(event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    onSubmitEditing?.(event);
    if (!multiline) dismissKeyboard();
  }

  const keyboardProps = {
    returnKeyType: resolvedReturnKeyType,
    blurOnSubmit: resolvedBlurOnSubmit,
    onSubmitEditing: handleSubmitEditing,
    keyboardType,
    ...resolvedAccessoryProps,
  };

  if (inline) {
    return (
      <TextInput
        {...props}
        {...keyboardProps}
        multiline={multiline}
        style={[
          styles.input,
          coreAlignedInputStyle(preset.fontSize, multiline),
          { fontWeight, color, flex: 1 },
          style,
        ]}
      />
    );
  }

  if (multiline) {
    const verticalPad = 12;
    return (
      <View
        style={[
          styles.shell,
          {
            minHeight: multilineMinHeight,
            borderRadius: preset.borderRadius,
            paddingHorizontal: preset.paddingHorizontal,
            paddingTop: verticalPad,
            paddingBottom: verticalPad,
            borderWidth: preset.borderWidth,
            alignItems: "stretch",
            justifyContent: "flex-start",
          },
          shellStyle,
        ]}
      >
        <TextInput
          {...props}
          {...keyboardProps}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.multilineInput,
            {
              fontSize: preset.fontSize,
              fontWeight,
              color,
              minHeight: multilineMinHeight - verticalPad * 2,
            },
            style,
          ]}
        />
      </View>
    );
  }

  const shellLayout = {
    height: preset.height,
    borderRadius: preset.borderRadius,
    paddingHorizontal: preset.paddingHorizontal,
    borderWidth: preset.borderWidth,
  };

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[styles.shell, shellLayout, shellStyle]}
      onPress={() => inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
        {...props}
        {...keyboardProps}
        accessibilityElementsHidden={shellAccessible}
        importantForAccessibility={shellAccessible ? "no-hide-descendants" : "auto"}
        style={[
          styles.input,
          styles.shellInput,
          { fontSize: preset.fontSize, fontWeight, color },
          style,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: "stretch",
    justifyContent: "center",
  },
  input: {
    letterSpacing: -0.18,
  },
  shellInput: {
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
    padding: 0,
    margin: 0,
    ...Platform.select({
      android: {
        paddingVertical: 0,
        textAlignVertical: "center",
        includeFontPadding: false,
      },
    }),
  },
  multilineInput: {
    padding: 0,
    margin: 0,
    lineHeight: 22,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
});
