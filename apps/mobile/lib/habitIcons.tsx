import type { ComponentType } from "react";

import {
  IconBan,
  IconBolt,
  IconBook,
  IconDeviceMobileOff,
  IconDroplet,
  IconMeat,
  IconMoon,
  IconPill,
  IconRun,
  IconScale,
  IconSnowflake,
  IconSun,
  IconToolsKitchen2,
} from "@/components/icons/FitnessIcons";
import type { IconProps } from "@/components/icons/types";
import { normalizeHabitIcon } from "@/lib/habits";

type IconComponent = ComponentType<IconProps>;

const HABIT_ICON_MAP: Record<string, IconComponent> = {
  drop: IconDroplet,
  run: IconRun,
  pill: IconPill,
  moon: IconMoon,
  scale: IconScale,
  sun: IconSun,
  ban: IconBan,
  book: IconBook,
  bolt: IconBolt,
  snowflake: IconSnowflake,
  food: IconToolsKitchen2,
  protein: IconMeat,
  "phone-off": IconDeviceMobileOff,
};

export function habitIconComponent(icon: string): IconComponent {
  const normalized = normalizeHabitIcon(icon);
  return HABIT_ICON_MAP[normalized] ?? HABIT_ICON_MAP.bolt;
}
