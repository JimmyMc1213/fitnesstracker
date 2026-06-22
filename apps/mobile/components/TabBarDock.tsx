import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkoutShell } from "@/context/WorkoutShellContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  FUTURE_YOU_GOLD,
  TAB_ACTIVE_BG_DARK,
  TAB_ACTIVE_BG_LIGHT,
  TAB_ACTIVE_BORDER_DARK,
  TAB_ACTIVE_BORDER_LIGHT,
  TAB_BAR_FLOAT_OFFSET,
  TABBAR_BG_DARK,
  TABBAR_BG_LIGHT,
  TABBAR_BORDER_DARK,
  TABBAR_BORDER_LIGHT,
  TAB_INACTIVE_FG_DARK,
  TAB_INACTIVE_FG_LIGHT,
} from "@/lib/futureYouTokens";

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabDescriptor = {
  options: {
    title?: string;
  };
};

type TabBarDockProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: Record<string, TabDescriptor>;
  navigation: unknown;
};

const MAIN_TABS = [
  {
    name: "home",
    label: "Home",
    testID: "tab-bar-home",
    symbol: { ios: "house.fill" as const, android: "home", web: "home" },
  },
  {
    name: "nutrition",
    label: "Nutrition",
    testID: "tab-bar-nutrition",
    symbol: { ios: "fork.knife" as const, android: "restaurant", web: "restaurant" },
  },
  {
    name: "workout",
    label: "Workout",
    testID: "tab-bar-workout",
    symbol: { ios: "dumbbell.fill" as const, android: "fitness_center", web: "fitness_center" },
  },
  {
    name: "progress",
    label: "Progress",
    testID: "tab-bar-progress",
    symbol: {
      ios: "chart.line.uptrend.xyaxis" as const,
      android: "trending_up",
      web: "trending_up",
    },
  },
] as const;

export function TabBarDock({ state, descriptors, navigation: navigationProp }: TabBarDockProps) {
  const { hideTabBar } = useWorkoutShell();
  const navigation = navigationProp as {
    emit: (event: { type: "tabPress"; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarBg = scheme === "dark" ? TABBAR_BG_DARK : TABBAR_BG_LIGHT;
  const tabBarBorder = scheme === "dark" ? TABBAR_BORDER_DARK : TABBAR_BORDER_LIGHT;
  const tabInactiveFg = scheme === "dark" ? TAB_INACTIVE_FG_DARK : TAB_INACTIVE_FG_LIGHT;
  const tabActiveBg = scheme === "dark" ? TAB_ACTIVE_BG_DARK : TAB_ACTIVE_BG_LIGHT;
  const tabActiveBorder = scheme === "dark" ? TAB_ACTIVE_BORDER_DARK : TAB_ACTIVE_BORDER_LIGHT;

  const futureYouRouteIndex = state.routes.findIndex((route) => route.name === "future-you");
  const isFutureYouFocused = state.index === futureYouRouteIndex;
  const nutritionRouteIndex = state.routes.findIndex((route) => route.name === "nutrition");
  const isNutritionFocused = state.index === nutritionRouteIndex;

  if (hideTabBar) {
    return null;
  }

  return (
    <View
      style={[
        styles.dock,
        {
          bottom: TAB_BAR_FLOAT_OFFSET,
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
          maxWidth: 400,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            paddingVertical: 4,
            paddingHorizontal: 11,
            borderRadius: 9999,
            borderWidth: 0.5,
            borderColor: tabBarBorder,
            backgroundColor: tabBarBg,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {MAIN_TABS.map((tab) => {
            const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
            if (routeIndex === -1) return null;

            const route = state.routes[routeIndex];
            const descriptor = descriptors[route.key];
            const focused = state.index === routeIndex;
            const tint = focused ? colors.textPrimary : tabInactiveFg;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={tab.name}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={descriptor.options.title ?? tab.label}
                testID={tab.testID}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  minWidth: 0,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  borderRadius: 9999,
                  backgroundColor: focused ? tabActiveBg : "transparent",
                  borderWidth: focused ? StyleSheet.hairlineWidth : 0,
                  borderColor: focused ? tabActiveBorder : "transparent",
                }}
              >
                <SymbolView name={tab.symbol} tintColor={tint} size={22} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: focused ? "600" : "500",
                    color: tint,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isNutritionFocused ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log food"
            testID="open-log-food"
            onPress={() => router.push("/log-food")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              marginBottom: 6,
              borderRadius: 9999,
              borderWidth: 0.5,
              borderColor: tabBarBorder,
              backgroundColor: "#ffffff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.38,
              shadowRadius: 14,
              elevation: 10,
            }}
          >
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              tintColor="#07080c"
              size={30}
              weight="semibold"
            />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={isFutureYouFocused ? { selected: true } : {}}
            accessibilityLabel="NewYou"
            testID="tab-fab-future-you"
            onPress={() => navigation.navigate("future-you")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minWidth: 72,
              minHeight: 72,
              paddingHorizontal: 13,
              paddingTop: 11,
              paddingBottom: 9,
              marginBottom: 6,
              borderRadius: 9999,
              borderWidth: 0.5,
              borderColor: isFutureYouFocused ? "rgba(201, 168, 118, 0.55)" : "rgba(201, 168, 118, 0.38)",
              backgroundColor: tabBarBg,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: isFutureYouFocused ? 0.42 : 0.38,
              shadowRadius: isFutureYouFocused ? 16 : 14,
              elevation: 10,
            }}
          >
            <SymbolView
              name={{ ios: "sparkles", android: "auto_awesome", web: "auto_awesome" }}
              tintColor={FUTURE_YOU_GOLD}
              size={26}
            />
            <Text
              style={{
                fontSize: 11,
                lineHeight: 12,
                fontWeight: "600",
                color: FUTURE_YOU_GOLD,
                textAlign: "center",
                maxWidth: 60,
              }}
            >
              NewYou
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    zIndex: 100,
    elevation: 100,
    ...(Platform.OS === "ios" ? { pointerEvents: "box-none" as const } : null),
  },
});
