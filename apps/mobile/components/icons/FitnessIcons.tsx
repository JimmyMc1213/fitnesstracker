import { Image, type ImageStyle, type StyleProp } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import type { IconProps } from "./types";

type SvgIconProps = IconProps & {
  children: React.ReactNode;
};

function SvgIcon({ size = 20, stroke = 1.5, color = "currentColor", children }: SvgIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function IconCheck({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </SvgIcon>
  );
}

export function IconChevR({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="m9 6 6 6-6 6" />
    </SvgIcon>
  );
}

export function IconChevL({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="m15 6-6 6 6 6" />
    </SvgIcon>
  );
}

export function IconPlus({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M12 5v14M5 12h14" />
    </SvgIcon>
  );
}

export function IconMinus({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M5 12h14" />
    </SvgIcon>
  );
}

export function IconLock({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" />
      <Path d="M11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
      <Path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </SvgIcon>
  );
}

export function IconGrip({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="9" cy="6" r="1.2" fill={color} stroke="none" />
      <Circle cx="15" cy="6" r="1.2" fill={color} stroke="none" />
      <Circle cx="9" cy="12" r="1.2" fill={color} stroke="none" />
      <Circle cx="15" cy="12" r="1.2" fill={color} stroke="none" />
      <Circle cx="9" cy="18" r="1.2" fill={color} stroke="none" />
      <Circle cx="15" cy="18" r="1.2" fill={color} stroke="none" />
    </SvgIcon>
  );
}

export function IconSearch({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

export function IconDroplet({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" />
    </SvgIcon>
  );
}

export function IconMoon({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z" fill="none" />
    </SvgIcon>
  );
}

export function IconSun({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="12" cy="12" r="4" fill="none" />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" fill="none" />
    </SvgIcon>
  );
}

export function IconBook({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <Path d="M8 7h7M8 11h7" />
    </SvgIcon>
  );
}

export function IconRun({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="14" cy="4" r="1.5" />
      <Path d="M9 21l3-7-3-3 4-4 3 4 3 1" />
      <Path d="M5 13l3-1 2 2" />
    </SvgIcon>
  );
}

export function IconPill({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M8 12h8" />
      <Rect x="4" y="8" width="16" height="8" rx="4" />
    </SvgIcon>
  );
}

export function IconScale({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M12 3v18" />
      <Path d="M5 7h14" />
      <Path d="M7 7 5 11h4l-2-4zM17 7l-2 4h4l-2-4z" />
    </SvgIcon>
  );
}

export function IconBan({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="m5 5 14 14" />
    </SvgIcon>
  );
}

export function IconBolt({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="m13 3-8 11h6l-1 7 8-11h-6l1-7z" />
    </SvgIcon>
  );
}

export function IconSnowflake({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />
    </SvgIcon>
  );
}

export function IconToolsKitchen2({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <Path d="M7 2v20" />
      <Path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </SvgIcon>
  );
}

export function IconMeat({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M13.5 2c-3 0-5.5 2.5-5.5 5.5 0 1.5.5 3 1.5 4L3 18.5 5.5 21l6.5-6.5c1 1 2.5 1.5 4 1.5 3 0 5.5-2.5 5.5-5.5S16.5 2 13.5 2Z" />
    </SvgIcon>
  );
}

export function IconDeviceMobileOff({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Rect x="7" y="3" width="10" height="18" rx="2" />
      <Path d="M11 19h2" />
      <Path d="m3 3 18 18" />
    </SvgIcon>
  );
}

export function IconSettings({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l-.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </SvgIcon>
  );
}

export function IconFutureYou({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <Path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <Path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
    </SvgIcon>
  );
}

export function IconBell({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M18 16H6l1.5-1.5A4 4 0 0 0 10 11V8a2 2 0 1 1 4 0v3a4 4 0 0 0 1.5 3.5L18 16z" />
      <Path d="M10 19a2 2 0 0 0 4 0" />
    </SvgIcon>
  );
}

export function IconShield({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
    </SvgIcon>
  );
}

export function IconMail({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Path d="m3 7 9 6 9-6" />
    </SvgIcon>
  );
}

export function IconSync({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Path d="M3 3v5h5" />
      <Path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <Path d="M16 21h5v-5" />
    </SvgIcon>
  );
}

export function IconFlag({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M5 21V4" />
      <Path d="M5 4h11l-2 3 2 3H5" />
    </SvgIcon>
  );
}

export function IconSpeakerphone({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M18 8a3 3 0 0 1 0 6" />
      <Path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" />
      <Path d="M12 8l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8" />
    </SvgIcon>
  );
}

export function IconDocument({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <Path d="M14 3v6h6" />
    </SvgIcon>
  );
}

export function IconLogout({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="M16 17l5-5-5-5" />
      <Path d="M21 12H9" />
    </SvgIcon>
  );
}

export function IconDumbbell({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="M3 9v6" />
      <Path d="M6 6v12" />
      <Path d="M9 8.5v7" />
      <Path d="M15 8.5v7" />
      <Path d="M18 6v12" />
      <Path d="M21 9v6" />
      <Path d="M9 12h6" />
    </SvgIcon>
  );
}

export function IconHabits({ size = 20, stroke = 1.5, color = "currentColor" }: IconProps) {
  return (
    <SvgIcon size={size} stroke={stroke} color={color}>
      <Path d="m9 11 2 2 4-4" />
      <Path d="M20 6H4" />
      <Path d="M20 12H4" />
      <Path d="M20 18H4" />
    </SvgIcon>
  );
}

export function IconMobilityRunner({
  size = 18,
  color = "rgba(196,181,253,0.95)",
  style,
}: IconProps & { color?: string; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      source={require("@/assets/mobility-runner.png")}
      accessibilityIgnoresInvertColors
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
        },
        style,
      ]}
    />
  );
}
