import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthNotice } from "@/components/AuthNotice";
import { AuthOAuthButtons } from "@/components/AuthOAuthButtons";
import { NewYouSplashMark } from "@/components/NewYouSplashMark";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { authLayout } from "@/lib/authLayoutStyles";

export default function SignInScreen() {
  const params = useLocalSearchParams<{ email?: string; info?: string }>();
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof params.email === "string" && params.email.trim()) {
      setEmail(params.email.trim());
    }
    if (typeof params.info === "string" && params.info.trim()) {
      setInfo(params.info.trim());
    }
  }, [params.email, params.info]);

  const handleSignIn = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithPassword(email, password);
      if (result.error) {
        setError(result.error);
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
      testID="auth-sign-in-screen"
    >
      <AuthNotice message={error} variant="error" testID="auth-sign-in-error" />
      <AuthNotice
        message={info}
        variant="info"
        testID="auth-sign-in-info"
        onDismiss={() => setInfo(null)}
      />

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
        >
          <Pressable onPress={() => router.back()} testID="auth-sign-in-back">
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
            testID="auth-sign-in-title"
          >
            Welcome back
          </Text>

          <View style={authLayout.inputStack}>
            <AuthTextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              onEndEditing={(event) => setEmail(event.nativeEvent.text.trim())}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email"
              testID="auth-sign-in-email"
            />
            <AuthTextField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              onEndEditing={(event) => setPassword(event.nativeEvent.text)}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Password"
              testID="auth-sign-in-password"
              onSubmitEditing={() => void handleSignIn()}
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
              onPress={() => void handleSignIn()}
              disabled={loading}
              testID="auth-sign-in-submit"
            >
              {loading ? (
                <ActivityIndicator color={ob.goldOn} />
              ) : (
                <Text style={[authLayout.primaryButtonText, { color: ob.goldOn, fontWeight: "700" }]}>
                  Sign In
                </Text>
              )}
            </Pressable>

            <Pressable
              style={{ alignItems: "center", paddingVertical: 8 }}
              onPress={() => router.replace("/(auth)/sign-up")}
              testID="auth-sign-in-to-sign-up"
            >
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Don&apos;t have an account?{" "}
                <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
