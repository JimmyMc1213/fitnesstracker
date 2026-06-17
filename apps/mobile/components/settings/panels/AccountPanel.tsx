import { Pressable, Text, View } from "react-native";

import {
  SettingsDetailCard,
  SettingsHelper,
  SettingsHubSection,
  SettingsRow,
} from "@/components/settings/SettingsLayout";
import { useAuth } from "@/context/AuthContext";
import { useFitnessSync } from "@/context/FitnessSyncContext";
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
  const { busy, lastError, lastSyncedLabel, syncNow } = useFitnessSync();
  const providers = connectedAuthProviders(session);

  const syncStatusTrailing = !configured
    ? "Not configured"
    : !sessionEmail
      ? "Sign in"
      : busy
        ? "Syncing…"
        : lastSyncedLabel
          ? `Last uploaded · ${lastSyncedLabel}`
          : "Ready";

  return (
    <View>
      <SettingsHelper>
        Sign in with the same account on your phone and computer to keep your fitness data in sync.
      </SettingsHelper>

      {!configured ? (
        <SettingsDetailCard>
          <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
            Cloud sync is off. The app does not see valid Supabase env vars. Add mobile Supabase keys and restart the
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
          {lastSyncedLabel ? (
            <Text className="mt-2 text-[12px]" style={{ color: colors.textTertiary }} testID="settings-account-sync-status">
              Last uploaded · {lastSyncedLabel}
            </Text>
          ) : null}
        </SettingsDetailCard>
      )}

      {lastError ? (
        <Text className="mb-3 px-1 text-[12px]" style={{ color: "#FF453A" }}>
          {lastError}
        </Text>
      ) : null}

      <SettingsHubSection title="Sync & backup">
        <SettingsRow
          icon={<Text style={{ color: colors.textTertiary }}>↻</Text>}
          label="Status"
          trailing={syncStatusTrailing}
          testID="settings-account-sync-status"
          disabled
        />
        <Pressable
          disabled={!configured || !sessionEmail || busy}
          onPress={() => void syncNow()}
          testID="settings-sync-now"
          accessibilityRole="button"
          accessibilityState={{ disabled: !configured || !sessionEmail || busy, busy }}
        >
          <SettingsRow
            icon={<Text style={{ color: colors.textTertiary }}>↑</Text>}
            label="Sync now"
            trailing={busy ? "…" : undefined}
            isLast
            disabled={!configured || !sessionEmail || busy}
          />
        </Pressable>
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
