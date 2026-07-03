import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthNotice } from "@/components/AuthNotice";
import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";

export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { signUpWithEmail } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, firstName, lastName);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        router.replace({
          pathname: "/(auth)/sign-in",
          params: {
            email: email.trim(),
            info: "Check your inbox and tap the confirmation link — it will open NewYou AI.",
          },
        });
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[authLayout.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AuthNotice message={error} variant="error" testID="auth-sign-up-error" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
      >
        <View
          style={[
            authLayout.screenPadding,
            {
              flexGrow: 1,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          testID="auth-sign-up-screen"
        >
          <Pressable onPress={() => router.back()} testID="auth-sign-up-back">
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Back</Text>
          </Pressable>

          <View style={{ marginTop: 24, alignItems: "center" }}>
            <NewYouSplashMark />
          </View>

          <Text
            style={[
              authLayout.headline,
              { marginTop: 32, color: colors.textPrimary, fontSize: 26 },
            ]}
            testID="auth-sign-up-title"
          >
            Create your account
          </Text>

          <View style={authLayout.inputStack}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <AuthTextField
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoComplete="given-name"
                  textContentType="givenName"
                  accessibilityLabel="First name"
                  testID="auth-sign-up-first-name"
                />
              </View>
              <View style={{ flex: 1 }}>
                <AuthTextField
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoComplete="family-name"
                  textContentType="familyName"
                  accessibilityLabel="Last name"
                  testID="auth-sign-up-last-name"
                />
              </View>
            </View>
            <AuthTextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email"
              testID="auth-sign-up-email"
            />
            <AuthTextField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Password"
              testID="auth-sign-up-password"
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <AuthOAuthButtons onError={setError} />
          </View>

          <View style={authLayout.footerActions}>
            <Pressable
              style={[
                authLayout.primaryButton,
                { backgroundColor: ob.gold, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={() => void handleSignUp()}
              disabled={loading}
              testID="auth-sign-up-submit"
            >
              {loading ? (
                <ActivityIndicator color={ob.goldOn} />
              ) : (
                <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                  Create Account
                </Text>
              )}
            </Pressable>

            <Pressable
              style={{ alignItems: "center", paddingVertical: 8 }}
              onPress={() => router.replace("/(auth)/sign-in")}
              testID="auth-sign-up-to-sign-in"
            >
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Already have an account?{" "}
                <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
