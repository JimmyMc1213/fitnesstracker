import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Keyboard, Platform, Pressable, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authLayout } from "@/lib/authLayoutStyles";

type AuthOAuthButtonsProps = {
  onError?: (message: string) => void;
  /** Renders the “or continue with” divider above Apple Sign-In. */
  showDivider?: boolean;
};

function AuthDivider() {
  const { colors } = useAppTheme();
  return (
    <View style={authLayout.oauthDividerRow} accessibilityElementsHidden>
      <View style={[authLayout.oauthDividerLine, { backgroundColor: colors.border }]} />
      <Text style={[authLayout.oauthDividerText, { color: colors.textTertiary }]}>or</Text>
      <View style={[authLayout.oauthDividerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function AppleLogo({ color }: { color: string }) {
  return (
    <SymbolView name="apple.logo" tintColor={color} size={18} style={{ width: 18, height: 18 }} />
  );
}

export function AuthOAuthButtons({ onError, showDivider = true }: AuthOAuthButtonsProps) {
  const { colors } = useAppTheme();
  const { signInWithApple } = useAuth();
  const [appleBusy, setAppleBusy] = useState(false);

  if (Platform.OS !== "ios") return null;

  const handleApple = async () => {
    setAppleBusy(true);
    Keyboard.dismiss();
    try {
      const result = await signInWithApple();
      if (result.error) onError?.(result.error);
    } catch {
      onError?.("Apple Sign-In failed. Try again.");
    } finally {
      setAppleBusy(false);
    }
  };

  return (
    <View style={authLayout.oauthStack}>
      {showDivider ? <AuthDivider /> : null}

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
        disabled={appleBusy}
        testID="auth-oauth-apple"
        accessibilityLabel="Continue with Apple"
      >
        {appleBusy ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <View style={authLayout.oauthButtonContent}>
            <AppleLogo color={colors.background} />
            <Text style={[authLayout.oauthButtonText, { color: colors.background }]}>
              Continue with Apple
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
