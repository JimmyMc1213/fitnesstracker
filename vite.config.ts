/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Always read `.env` from this folder (same as vite.config.ts / package.json).
  const loaded = loadEnv(mode, __dirname, "VITE_");

  return {
    plugins: [react()],
    /** Embed Supabase vars from disk so dev/build never misses `.env` due to cwd quirks. */
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(loaded.VITE_SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(loaded.VITE_SUPABASE_ANON_KEY ?? ""),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        loaded.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      ),
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
