export const SETTINGS_PANEL_IDS = [
  "you",
  "account",
  "appearance",
  "units",
  "fuel-targets",
  "hydration",
  "goal",
  "reminders",
  "rest-timer",
  "equipment",
  "habits",
  "program",
] as const;

export type SettingsPanelId = (typeof SETTINGS_PANEL_IDS)[number];

export const PANEL_TITLES: Record<SettingsPanelId, string> = {
  you: "You",
  account: "Account",
  appearance: "Appearance",
  units: "Units",
  "fuel-targets": "Fuel targets",
  hydration: "Hydration",
  goal: "Goal",
  reminders: "Reminders",
  "rest-timer": "Rest timer",
  equipment: "Equipment",
  habits: "Habits checklist",
  program: "Program",
};

export function isSettingsPanelId(value: string): value is SettingsPanelId {
  return (SETTINGS_PANEL_IDS as readonly string[]).includes(value);
}
