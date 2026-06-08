import {
  IconBan,
  IconBolt,
  IconBook,
  IconDeviceMobileOff,
  IconDroplet,
  IconMeat,
  IconMoon,
  IconPill,
  IconScaleOutline,
  IconSnowflake,
  IconSun,
  IconToolsKitchen2,
  IconWalk,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

import { normalizeHabitIcon } from "./habits";
import type { IconProps } from "./types";

type IconComponent = (p: IconProps) => JSX.Element;

function tablerIcon(Icon: TablerIcon): IconComponent {
  return ({ size = 20, stroke = 2, style, className }) => (
    <Icon size={size} stroke={stroke} style={style} className={className} aria-hidden />
  );
}

const HABIT_ICON_MAP: Record<string, IconComponent> = {
  drop: tablerIcon(IconDroplet),
  run: tablerIcon(IconWalk),
  pill: tablerIcon(IconPill),
  moon: tablerIcon(IconMoon),
  scale: tablerIcon(IconScaleOutline),
  sun: tablerIcon(IconSun),
  ban: tablerIcon(IconBan),
  book: tablerIcon(IconBook),
  bolt: tablerIcon(IconBolt),
  snowflake: tablerIcon(IconSnowflake),
  food: tablerIcon(IconToolsKitchen2),
  protein: tablerIcon(IconMeat),
  "phone-off": tablerIcon(IconDeviceMobileOff),
};

export function habitIconComponent(icon: string): IconComponent {
  const normalized = normalizeHabitIcon(icon);
  return HABIT_ICON_MAP[normalized] ?? HABIT_ICON_MAP.bolt;
}
