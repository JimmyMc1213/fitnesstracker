import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";

type AuthOAuthButtonsProps = {
  onError?: (message: string) => void;
};

function AuthDivider() {
  const { colors } = useAppTheme();
  return (
    <View style={authLayout.oauthDividerRow} accessibilityElementsHidden>
      <View style={[authLayout.oauthDividerLine, { backgroundColor: colors.border }]} />
      <Text style={[authLayout.oauthDividerText, { color: colors.textTertiary }]}>
        or continue with
      </Text>
      <View style={[authLayout.oauthDividerLine, { backgroundColor: colors.border }]} />
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
    <View style={authLayout.oauthStack}>
      <AuthDivider />

      {Platform.OS === "ios" ? (
        <Pressable
          style={[
            authLayout.oauthButton,
            {
              backgroundColor: colors.textPrimary,
              borderColor: colors.textPrimary,
              opacity: appleBusy ? 0.7 : 1,
            },
          ]}
          onPress={() => void handleApple()}
          disabled={loadingProvider !== null}
          testID="auth-oauth-apple"
          accessibilityLabel="Continue with Apple"
        >
          {appleBusy ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[authLayout.oauthButtonText, { color: colors.background }]}>
              Continue with Apple
            </Text>
          )}
        </Pressable>
      ) : null}

      <Pressable
        style={[
          authLayout.oauthButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: googleBusy ? 0.7 : 1,
          },
        ]}
        onPress={() => void handleGoogle()}
        disabled={loadingProvider !== null}
        testID="auth-oauth-google"
        accessibilityLabel="Continue with Google"
      >
        {googleBusy ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={[authLayout.oauthButtonText, { color: colors.textPrimary }]}>
            Continue with Google
          </Text>
        )}
      </Pressable>
    </View>
  );
}
