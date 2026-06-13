import Animated, { useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAnimatedMacroProgress } from "@/components/home/useAnimatedMacroProgress";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  value: number;
  target: number;
  size?: number;
  stroke?: number;
  animate?: boolean;
  testID?: string;
};

export function MacroRing({
  value,
  target,
  size = 96,
  stroke = 5,
  animate = true,
  testID = "macro-ring-cal",
}: Props) {
  const { colors } = useAppTheme();
  const { ringPct } = useAnimatedMacroProgress(value, target, animate);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - ringPct.value),
  }));

  return (
    <View
      testID={testID}
      style={{ width: size, height: size, position: "relative" }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View
        className="absolute inset-0 items-center justify-center"
        style={{ gap: 4 }}
      >
        <Text
          className="text-2xl font-bold tabular-nums tracking-tight"
          style={{ color: colors.textPrimary }}
        >
          {Math.round(value)}
        </Text>
        <Text className="text-[10px]" style={{ color: colors.textTertiary }}>
          of {target} cal
        </Text>
      </View>
    </View>
  );
}
