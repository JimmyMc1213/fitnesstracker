import type { IconProps } from "./types";

function Icon({ d, size = 20, stroke = 1.5, children, ...rest }: IconProps & { d?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  );
}

export function IconFork(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M7 3v8a2 2 0 0 0 2 2v8" />
      <path d="M11 3v8" />
      <path d="M15 3v6c0 1.5 1 2 2 2v10" />
    </Icon>
  );
}

export function IconDumbbell(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M3 9v6" />
      <path d="M6 6v12" />
      <path d="M9 8.5v7" />
      <path d="M15 8.5v7" />
      <path d="M18 6v12" />
      <path d="M21 9v6" />
      <path d="M9 12h6" />
    </Icon>
  );
}

export function IconChart(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M3 20h18" />
      <path d="M5 16l4-5 4 3 6-8" />
    </Icon>
  );
}

export function IconScan(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </Icon>
  );
}

export function IconHabits(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="m9 11 2 2 4-4" />
      <path d="M20 6H4" />
      <path d="M20 12H4" />
      <path d="M20 18H4" />
    </Icon>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconMinus(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

export function IconX(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    </Icon>
  );
}

export function IconPencil(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

export function IconGrip(p: IconProps) {
  return (
    <Icon {...p} stroke={p.stroke ?? 2}>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function IconChevR(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function IconChevL(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="m15 5-7 7 7 7" />
    </Icon>
  );
}

export function IconArrowUp(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </Icon>
  );
}

export function IconArrowDown(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </Icon>
  );
}

export function IconFlame(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s1 2 3 2c0-3-1-5 1-8z" />
    </Icon>
  );
}

export function IconBolt(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="m13 3-8 11h6l-1 7 8-11h-6l1-7z" />
    </Icon>
  );
}

export function IconDroplet(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" />
    </Icon>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z" />
    </Icon>
  );
}

export function IconBook(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h7M8 11h7" />
    </Icon>
  );
}

export function IconRun(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="14" cy="4" r="1.5" />
      <path d="M9 21l3-7-3-3 4-4 3 4 3 1" />
      <path d="M5 13l3-1 2 2" />
    </Icon>
  );
}

export function IconFlash(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M5 12h2M17 12h2M12 5V3M12 21v-2" />
      <circle cx="12" cy="12" r="4" />
    </Icon>
  );
}

export function IconKeyboard(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
    </Icon>
  );
}

export function IconSettings(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Icon>
  );
}
