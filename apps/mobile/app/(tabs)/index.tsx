import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View
      className="px-screen-x"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
      testID="home-screen"
    >
      <Text
        className="mb-3 text-[28px] font-bold"
        style={{ color: colors.textPrimary }}
        testID="home-title"
      >
        New You AI
      </Text>
      <Text className="mb-2 text-center text-base" style={{ color: colors.textSecondary }}>
        Native iOS app — authentication & session (RN-2)
      </Text>
      <Text className="mb-8 text-center text-sm" style={{ color: colors.textTertiary }}>
        Light/dark tokens follow system appearance. Full settings ship in RN-10.
      </Text>

      <Pressable
        className="min-w-[160px] items-center rounded-full border px-6 py-3"
        style={{ borderColor: colors.border, opacity: signingOut ? 0.7 : 1 }}
        onPress={() => void handleSignOut()}
        disabled={signingOut}
        testID="home-sign-out"
        accessibilityLabel="Sign out"
      >
        {signingOut ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Sign out
          </Text>
        )}
      </Pressable>
    </View>
  );
}
