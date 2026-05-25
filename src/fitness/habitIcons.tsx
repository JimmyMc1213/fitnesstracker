import {
  IconBan,
  IconBolt,
  IconBook,
  IconDroplet,
  IconMoon,
  IconPill,
  IconRun,
  IconScale,
  IconSun,
} from "./icons";
import { normalizeHabitIcon } from "./habits";
import type { IconProps } from "./types";

type IconComponent = (p: IconProps) => JSX.Element;

export function habitIconComponent(icon: string): IconComponent {
  const normalized = normalizeHabitIcon(icon);
  switch (normalized) {
    case "drop":
      return IconDroplet;
    case "run":
      return IconRun;
    case "pill":
      return IconPill;
    case "moon":
      return IconMoon;
    case "scale":
      return IconScale;
    case "sun":
      return IconSun;
    case "ban":
      return IconBan;
    case "book":
      return IconBook;
    default:
      return IconBolt;
  }
}
