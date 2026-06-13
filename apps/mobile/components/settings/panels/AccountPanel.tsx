import { Text, View } from "react-native";

import {
  SettingsDetailCard,
  SettingsHelper,
  SettingsHubSection,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { connectedAuthProviders } from "@/lib/accountAuth";

function providerLabel(provider: string): string {
  if (provider === "apple") return "Apple";
  if (provider === "google") return "Google";
  if (provider === "email") return "Email";
  return provider;
}

export function AccountPanel() {
  const { colors } = useAppTheme();
  const { configured, sessionEmail, session } = useAuth();
  const providers = connectedAuthProviders(session);

  return (
    <View>
      <SettingsHelper>
        Sign in with the same account on your phone and computer. Cloud sync details land in a later release.
      </SettingsHelper>

      {!configured ? (
        <SettingsDetailCard>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Cloud sync is off — the app does not see valid Supabase env vars. Add mobile Supabase keys and restart the
            dev client.
          </Text>
        </SettingsDetailCard>
      ) : !sessionEmail ? (
        <SettingsDetailCard>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Sign in from the auth screen to link this device to your account.
          </Text>
        </SettingsDetailCard>
      ) : (
        <SettingsDetailCard>
          <Text className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
            Signed in
          </Text>
          <Text className="mt-1 text-[13px]" style={{ color: colors.textSecondary }}>
            {sessionEmail}
          </Text>
          <Text className="mt-2 text-[12px]" style={{ color: colors.textTertiary }}>
            Signed in
          </Text>
        </SettingsDetailCard>
      )}

      <SettingsHubSection title="Sync & backup">
        <SettingsRow
          icon={<Text style={{ color: colors.textTertiary }}>↻</Text>}
          label="Status"
          trailing={!configured ? "Not configured" : sessionEmail ? "Signed in" : "Sign in"}
          isLast
          disabled
        />
      </SettingsHubSection>

      {providers.length > 0 ? (
        <SettingsHubSection title="Connected accounts">
          {providers.map((provider, index) => (
            <SettingsRow
              key={provider}
              label={providerLabel(provider)}
              trailing="Connected"
              isLast={index === providers.length - 1}
              disabled
            />
          ))}
        </SettingsHubSection>
      ) : null}
    </View>
  );
}
