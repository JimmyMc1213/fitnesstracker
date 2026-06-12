import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

type AuthOAuthButtonsProps = {
  onError?: (message: string) => void;
};

function AuthDivider() {
  const { colors } = useAppTheme();
  return (
    <View className="my-2 flex-row items-center gap-3" accessibilityElementsHidden>
      <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
      <Text className="text-xs" style={{ color: colors.textTertiary }}>
        or continue with
      </Text>
      <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
    </View>
  );
}

export function AuthOAuthButtons({ onError }: AuthOAuthButtonsProps) {
  const { colors } = useAppTheme();
  const { signInWithOAuth, signInWithApple } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

  const handleGoogle = async () => {
    setLoadingProvider("google");
    try {
      const result = await signInWithOAuth("google");
      if (result.error) onError?.(result.error);
    } catch {
      onError?.("Google sign-in failed. Try again.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleApple = async () => {
    setLoadingProvider("apple");
    try {
      const result = await signInWithApple();
      if (result.error) onError?.(result.error);
    } catch {
      onError?.("Apple Sign-In failed. Try again.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const googleBusy = loadingProvider === "google";
  const appleBusy = loadingProvider === "apple";

  return (
    <View className="gap-3">
      <AuthDivider />

      {Platform.OS === "ios" ? (
        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-full border py-4"
          style={{
            backgroundColor: colors.textPrimary,
            borderColor: colors.textPrimary,
            opacity: appleBusy ? 0.7 : 1,
          }}
          onPress={() => void handleApple()}
          disabled={loadingProvider !== null}
          testID="auth-oauth-apple"
          accessibilityLabel="Continue with Apple"
        >
          {appleBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-base font-semibold" style={{ color: colors.background }}>
              Continue with Apple
            </Text>
          )}
        </Pressable>
      ) : null}

      <Pressable
        className="flex-row items-center justify-center gap-2 rounded-full border py-4"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: googleBusy ? 0.7 : 1,
        }}
        onPress={() => void handleGoogle()}
        disabled={loadingProvider !== null}
        testID="auth-oauth-google"
        accessibilityLabel="Continue with Google"
      >
        {googleBusy ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Continue with Google
          </Text>
        )}
      </Pressable>
    </View>
  );
}
