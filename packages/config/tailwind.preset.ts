import type { Config } from "tailwindcss";

/** Brand tokens aligned with apps/pwa CSS variables (New You AI dark theme). */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        card: "#161616",
        muted: "#888888",
        accent: "#3B82F6",
        border: "#2a2a2a",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "system-ui", "sans-serif"],
      },
    },
  },
};

export default preset;
