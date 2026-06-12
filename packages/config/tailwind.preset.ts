import type { Config } from "tailwindcss";

import { borderRadius, spacing, tailwindColors } from "./tokens";

/** Brand tokens aligned with apps/pwa/src/fitness/theme.ts (New You AI). */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: tailwindColors,
      spacing: {
        "screen-x": `${spacing.screenX}px`,
        "card-pad": `${spacing.cardPadding}px`,
        "section-gap": `${spacing.sectionGap}px`,
      },
      borderRadius: {
        card: `${borderRadius.card}px`,
        pill: `${borderRadius.pill}px`,
        button: `${borderRadius.button}px`,
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
    },
  },
};

export default preset;
