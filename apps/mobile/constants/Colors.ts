import { darkThemeColors, lightThemeColors } from "@newyouai/config/tokens";

export default {
  light: {
    text: lightThemeColors.textPrimary,
    background: lightThemeColors.background,
    tint: lightThemeColors.accent,
    tabIconDefault: lightThemeColors.textTertiary,
    tabIconSelected: lightThemeColors.accent,
  },
  dark: {
    text: darkThemeColors.textPrimary,
    background: darkThemeColors.background,
    tint: darkThemeColors.accent,
    tabIconDefault: darkThemeColors.textTertiary,
    tabIconSelected: darkThemeColors.accent,
  },
};
