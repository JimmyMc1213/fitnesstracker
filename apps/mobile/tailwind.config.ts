import type { Config } from "tailwindcss";

import brandPreset from "@newyouai/config/tailwind";

// NativeWind ships the preset as CJS; require avoids TS module resolution errors.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativewind = require("nativewind/preset") as Config;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewind, brandPreset],
};

export default config;
