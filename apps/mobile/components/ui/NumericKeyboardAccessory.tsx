import { InputAccessoryView, Platform, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { dismissKeyboard, NUMERIC_KEYBOARD_ACCESSORY_ID } from "@/lib/keyboard";
import { useAppTheme } from "@/hooks/useAppTheme";

/** Global iOS toolbar for number-pad / decimal-pad fields without a return key. */
export function NumericKeyboardAccessory() {
  const { colors } = useAppTheme();

  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={NUMERIC_KEYBOARD_ACCESSORY_ID}>
      <View
        className="flex-row items-center justify-end border-t px-3 py-2"
        style={{ borderTopColor: colors.border, backgroundColor: colors.backgroundSecondary }}
      >
        <Pressable
          onPress={dismissKeyboard}
          accessibilityRole="button"
          accessibilityLabel="Done"
          className="min-h-[36px] justify-center px-3"
        >
          <Text className="text-base font-semibold" style={{ color: colors.accent }}>
            Done
          </Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
