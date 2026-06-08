import type { Config } from "tailwindcss";

import preset from "@newyouai/config/tailwind";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  presets: [preset],
};

export default config;
