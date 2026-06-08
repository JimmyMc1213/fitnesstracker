/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  // Prefer apps/pwa/.env, fall back to repo-root .env during monorepo transition.
  const loaded = {
    ...loadEnv(mode, repoRoot, "VITE_"),
    ...loadEnv(mode, __dirname, "VITE_"),
  };

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      react(),
      svgr({
        include: "**/src/assets/brand-icons/*.svg",
      }),
    ],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(loaded.VITE_SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(loaded.VITE_SUPABASE_ANON_KEY ?? ""),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        loaded.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      ),
      "import.meta.env.VITE_E2E_MOCK_FOOD_SEARCH": JSON.stringify(
        loaded.VITE_E2E_MOCK_FOOD_SEARCH ?? "",
      ),
      "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? ""),
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
