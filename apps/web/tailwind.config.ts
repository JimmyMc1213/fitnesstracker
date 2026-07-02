import type { Config } from "tailwindcss";

import preset from "@newyouai/config/tailwind";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [preset],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#17150E",
          muted: "#3A382E",
          secondary: "#56544A",
        },
        stone: {
          DEFAULT: "#75736A",
          light: "#9C9A90",
        },
        gold: {
          DEFAULT: "#9C7C3E",
          light: "#CAA668",
          border: "#EBDFC4",
          wash: "#FBF4E4",
        },
        sand: "#ECE8DE",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "phone-dark-rail":
          "linear-gradient(145deg,#6c6c6e,#2c2c2e 22%,#4a4a4c 46%,#1d1d1f 72%,#3c3c3e)",
        "phone-titanium-rail":
          "linear-gradient(145deg,#6a665d,#2a2823 22%,#4a463d 46%,#1d1b16 72%,#3a372f)",
      },
    },
  },
};

export default config;
