import type { ReactNode } from "react";
import { Pressable, Text, View, type TextInputProps } from "react-native";

import { AppTextField } from "@/components/ui/AppTextField";
import { GradientCard } from "@/components/ui/GradientCard";
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
      <GradientCard padding={0}>{children}</GradientCard>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  labelColor,
  trailing,
  onPress,
  disabled,
  testID,
  isLast,
}: {
  icon?: ReactNode;
  label: string;
  labelColor?: string;
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
      {icon ? icon : null}
      <Text className="flex-1 text-[15px] font-medium" style={{ color: labelColor ?? colors.textPrimary }}>
        {label}
      </Text>
      <View className="ml-2 flex-row items-center shrink" style={{ maxWidth: "52%" }}>
        {trailing !== undefined &&
        trailing !== null &&
        trailing !== "" &&
        typeof trailing !== "string" ? (
          <View className="mr-1">{trailing}</View>
        ) : null}
        {interactive ? (
          <Text className="text-[22px] font-medium" style={{ color: colors.textPrimary }}>
            ›
          </Text>
        ) : null}
      </View>
    </>
  );

  const rowStyle = {
    opacity: disabled ? 0.55 : 1,
  };

  const divider = isLast ? null : (
    <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
  );

  if (interactive) {
    return (
      <View>
        <Pressable
          testID={testID}
          onPress={onPress}
          className="flex-row items-center px-4 py-3.5"
          style={rowStyle}
        >
          {content}
        </Pressable>
        {divider}
      </View>
    );
  }

  return (
    <View>
      <View testID={testID} className="flex-row items-center px-4 py-3.5" style={rowStyle}>
        {content}
      </View>
      {divider}
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
    <Pressable testID="settings-profile-card" onPress={onPress} className="mb-5">
      <GradientCard>
        <View className="flex-row items-center">
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
        </View>
      </GradientCard>
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
  return (
    <GradientCard spacious style={{ marginBottom: 16 }}>
      <View style={{ gap: 12 }}>{children}</View>
    </GradientCard>
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

export function SettingsFormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <SettingsFieldLabel>{label}</SettingsFieldLabel>
      {children}
    </View>
  );
}

export function SettingsTextField(props: TextInputProps) {
  return <AppTextField {...props} />;
}

export function SettingsFormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <Text
      className="text-[13px] leading-[1.45]"
      style={{ color: tone === "error" ? "#f87171" : colors.textSecondary }}
    >
      {children}
    </Text>
  );
}

export function SettingsProfileHeader({ name, email }: { name: string; email?: string | null }) {
  const { colors } = useAppTheme();
  const trimmed = name.trim();
  const initial = (trimmed[0] ?? "?").toUpperCase();
  const displayName = trimmed || "Add your name";

  return (
    <View className="flex-row items-center">
      <View
        className="mr-3.5 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.backgroundTertiary }}
      >
        <Text className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
          {initial}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[18px] font-semibold" style={{ color: colors.textPrimary }}>
          {displayName}
        </Text>
        {email ? (
          <Text
            className="mt-0.5 text-[13px]"
            style={{ color: colors.textTertiary }}
            numberOfLines={1}
          >
            {email}
          </Text>
        ) : (
          <Text className="mt-0.5 text-[13px]" style={{ color: colors.textTertiary }}>
            Personal details
          </Text>
        )}
      </View>
    </View>
  );
}

export function SettingsPrimaryButton({
  label,
  onPress,
  disabled,
  testID,
  expand,
  fullWidth,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  expand?: boolean;
  fullWidth?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-xl px-4 py-3${expand ? " flex-1" : ""}${fullWidth ? " w-full" : ""}`}
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

export function SettingsSecondaryButton({
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
      className="flex-1 items-center rounded-xl border px-4 py-3"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.backgroundSecondary,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text className="text-[14px] font-semibold" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}
