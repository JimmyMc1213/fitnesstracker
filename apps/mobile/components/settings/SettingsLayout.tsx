import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

export function SettingsHubSection({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-5">
      <Text
        className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textTertiary }}
      >
        {title}
      </Text>
      <View
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  trailing,
  onPress,
  disabled,
  testID,
  isLast,
}: {
  icon?: ReactNode;
  label: string;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  isLast?: boolean;
}) {
  const { colors } = useAppTheme();
  const interactive = Boolean(onPress) && !disabled;

  const content = (
    <>
      {icon ? (
        <View className="mr-3 w-5 items-center justify-center" style={{ opacity: 0.85 }}>
          {icon}
        </View>
      ) : null}
      <Text className="flex-1 text-[15px] font-medium" style={{ color: colors.textPrimary }}>
        {label}
      </Text>
      <View className="ml-2 flex-row items-center shrink" style={{ maxWidth: "52%" }}>
        {trailing !== undefined && trailing !== null && trailing !== "" ? (
          typeof trailing === "string" ? (
            <Text
              className="mr-1 text-[13px] font-medium shrink"
              style={{ color: colors.textTertiary }}
              numberOfLines={1}
            >
              {trailing}
            </Text>
          ) : (
            trailing
          )
        ) : null}
        {interactive ? <Text style={{ color: colors.textTertiary }}>›</Text> : null}
      </View>
    </>
  );

  const rowStyle = {
    borderBottomColor: colors.border,
    borderBottomWidth: isLast ? 0 : 1,
    opacity: disabled ? 0.55 : 1,
  };

  if (interactive) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        className="flex-row items-center px-4 py-3.5"
        style={rowStyle}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} className="flex-row items-center px-4 py-3.5" style={rowStyle}>
      {content}
    </View>
  );
}

export function SettingsComingSoonRow({
  icon,
  label,
  testID,
  isLast,
}: {
  icon?: ReactNode;
  label: string;
  testID?: string;
  isLast?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <SettingsRow
      icon={icon}
      label={label}
      testID={testID}
      isLast={isLast}
      disabled
      trailing={
        <Text className="text-[12px] font-medium" style={{ color: colors.textTertiary }}>
          Coming soon
        </Text>
      }
    />
  );
}

export function SettingsProfileCard({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const trimmed = name.trim();
  const initial = (trimmed[0] ?? "?").toUpperCase();
  const displayName = trimmed || "Add your name";

  return (
    <Pressable
      testID="settings-profile-card"
      onPress={onPress}
      className="mb-5 flex-row items-center rounded-xl border px-4 py-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.backgroundTertiary }}
      >
        <Text className="text-[18px] font-bold" style={{ color: colors.textPrimary }}>
          {initial}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[16px] font-semibold" style={{ color: colors.textPrimary }}>
          {displayName}
        </Text>
        <Text className="mt-0.5 text-[13px]" style={{ color: colors.textTertiary }}>
          Personal details
        </Text>
      </View>
      <Text style={{ color: colors.textTertiary }}>›</Text>
    </Pressable>
  );
}

export function SettingsHelper({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Text className="mb-3 text-[13px] leading-[1.45]" style={{ color: colors.textSecondary }}>
      {children}
    </Text>
  );
}

export function SettingsDetailCard({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="mb-4 rounded-xl border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card, gap: 12 }}
    >
      {children}
    </View>
  );
}

export function SettingsFieldLabel({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <Text
      className="text-[11px] font-medium uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {children}
    </Text>
  );
}

export function SettingsPrimaryButton({
  label,
  onPress,
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      className="items-center rounded-xl px-4 py-3"
      style={{
        backgroundColor: disabled ? colors.backgroundTertiary : colors.backgroundSecondary,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text className="text-[14px] font-bold" style={{ color: colors.textPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}
