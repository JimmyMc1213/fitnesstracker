import { ActivityIndicator, View, type ViewProps } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type AppShellLoadingProps = ViewProps;

export function AppShellLoading(props: AppShellLoadingProps) {
  const { colors } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
        props.style,
      ]}
      testID="app-shell-loading"
    >
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}
