import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";

type AuthNoticeProps = {
  message: string | null;
  variant?: "error" | "info";
  testID?: string;
  onDismiss?: () => void;
};

export function AuthNotice({
  message,
  variant = "error",
  testID,
  onDismiss,
}: AuthNoticeProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!message || variant !== "info" || !onDismiss) return;
    const id = setTimeout(onDismiss, 6000);
    return () => clearTimeout(id);
  }, [message, variant, onDismiss]);

  if (!message) return null;

  const isError = variant === "error";

  return (
    <View
      style={[
        styles.banner,
        { top: insets.top + 8 },
        isError ? styles.errorBanner : { backgroundColor: colors.backgroundSecondary },
      ]}
      testID={testID}
      accessibilityRole="alert"
      pointerEvents="none"
    >
      <Text
        style={[
          styles.text,
          { color: isError ? "#ef4444" : colors.textSecondary },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
