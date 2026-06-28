import type { AppTheme } from "@newyouai/types";
import { useEffect, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { IconMoon, IconSun } from "@/components/icons/FitnessIcons";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { PressableScale } from "@/components/ui/PressableScale";
import { onboardingThemeFor } from "@/lib/onboardingTheme";

type Props = {
  step: number;
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
  onBack?: () => void;
  onContinue: () => void;
};

const TRACK_PADDING = 5;
const SWITCH_MAX_WIDTH = 320;
const SWITCH_MIN_HEIGHT = 72;

/** PWA `--ob-theme-switch-track-*` — follows the selected preview theme. */
function themeSwitchTrackTokens(pageIsLight: boolean) {
  if (pageIsLight) {
    return { trackBg: "#e5e5ea", trackBorder: "#c7c7cc" };
  }
  return { trackBg: "#26262c", trackBorder: "rgba(255, 255, 255, 0.22)" };
}

function SwitchOption({
  label,
  icon,
  active,
  activeColor,
  inactiveColor,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ zIndex: 10, minHeight: 62, flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 }}
    >
      <View style={{ opacity: active ? 1 : 0.72 }}>{icon}</View>
      <Text
        className="text-[15px] font-semibold tracking-tight"
        style={{ color: active ? activeColor : inactiveColor }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export function OnboardingThemePicker({ step, value, onChange, onBack, onContinue }: Props) {
  // Match PWA: switch track, thumb, and icon colors follow the selected preview theme.
  const ob = onboardingThemeFor(value);
  const pageIsLight = value === "light";
  const track = themeSwitchTrackTokens(pageIsLight);
  const selectedIsLight = value === "light";
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbOffset = useSharedValue(selectedIsLight ? 0 : 1);

  useEffect(() => {
    thumbOffset.value = withTiming(selectedIsLight ? 0 : 1, {
      duration: 380,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [selectedIsLight, thumbOffset]);

  const thumbStyle = useAnimatedStyle(() => {
    const innerWidth = Math.max(0, trackWidth - TRACK_PADDING * 2);
    const thumbWidth = innerWidth / 2;
    return {
      transform: [{ translateX: thumbOffset.value * thumbWidth }],
    };
  }, [trackWidth]);

  function selectTheme(next: AppTheme) {
    if (next !== value) onChange(next);
  }

  return (
    <OnboardingShell
      step={step}
      title="Choose your look"
      subtitle="You can change this anytime in Settings"
      scrollEnabled={false}
      onBack={onBack}
      onContinue={onContinue}
      hideProgress
      testID="onboarding-step-1"
    >
      <View className="items-center justify-center px-1 py-8">
        <View
          className="w-full"
          style={{ maxWidth: SWITCH_MAX_WIDTH }}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        >
          <View
            accessibilityRole="switch"
            accessibilityState={{ checked: selectedIsLight }}
            accessibilityLabel={`Theme: ${selectedIsLight ? "Light" : "Dark"}`}
            className="relative overflow-hidden rounded-full border-[1.5px]"
            style={{
              minHeight: SWITCH_MIN_HEIGHT,
              padding: TRACK_PADDING,
              borderColor: track.trackBorder,
              backgroundColor: track.trackBg,
            }}
          >
            {trackWidth > 0 ? (
              <Animated.View
                pointerEvents="none"
                className="absolute rounded-full"
                style={[
                  {
                    zIndex: 1,
                    top: TRACK_PADDING,
                    left: TRACK_PADDING,
                    width: (trackWidth - TRACK_PADDING * 2) / 2,
                    height: SWITCH_MIN_HEIGHT - TRACK_PADDING * 2,
                    backgroundColor: ob.pillSelectedBg,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.14,
                    shadowRadius: 14,
                    elevation: 4,
                  },
                  thumbStyle,
                ]}
              />
            ) : null}
            <View className="flex-row" style={{ zIndex: 2 }}>
              <SwitchOption
                label="Light"
                icon={
                  <IconSun
                    size={22}
                    stroke={1.6}
                    color={selectedIsLight ? ob.pillSelectedFg : ob.mutedFg}
                  />
                }
                active={selectedIsLight}
                activeColor={ob.pillSelectedFg}
                inactiveColor={ob.mutedFg}
                onPress={() => selectTheme("light")}
              />
              <SwitchOption
                label="Dark"
                icon={
                  <IconMoon
                    size={22}
                    stroke={1.6}
                    color={!selectedIsLight ? ob.pillSelectedFg : ob.mutedFg}
                  />
                }
                active={!selectedIsLight}
                activeColor={ob.pillSelectedFg}
                inactiveColor={ob.mutedFg}
                onPress={() => selectTheme("dark")}
              />
            </View>
          </View>
        </View>
        <Text className="mt-4 text-center text-[11px] font-bold tracking-wide" style={{ color: ob.helper }}>
          {selectedIsLight ? "Clean and bright" : "Easy on the eyes"}
        </Text>
      </View>
    </OnboardingShell>
  );
}
