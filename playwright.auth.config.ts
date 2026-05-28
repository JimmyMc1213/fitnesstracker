import { defineConfig, devices } from "@playwright/test";

/** Auth-gate tests against the running Vite dev server (Supabase from .env). Start `npm run dev` first. */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "auth-gate.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
