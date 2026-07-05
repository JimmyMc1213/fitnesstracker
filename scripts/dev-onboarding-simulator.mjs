#!/usr/bin/env node
/**
 * One command: iOS Simulator + Metro + onboarding-friendly env.
 *
 * Usage (from repo root):
 *   npm run dev:onboarding
 *
 * Requires the EAS dev client on the simulator (one-time):
 *   cd apps/mobile && npm run eas build -- --profile development --platform ios
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  attachMetroChildHandlers,
  bootSimulatorIfNeeded,
  gitShortHead,
  isDevClientInstalled,
  isMetroRunning,
  killPort,
  openSimulatorOnMetro,
  SIMULATOR_METRO_PORT,
} from "./simulator-metro-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const clearCache = process.argv.includes("--clear") || process.env.DEV_ONBOARDING_CLEAR === "1";
const forceRestart = process.argv.includes("--restart");

console.log("");
console.log("New You AI — onboarding on iOS Simulator");
console.log("────────────────────────────────────────");
console.log("");
console.log("Env (set for this Metro session):");
console.log("  • EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING=false  → wizard after sign-in");
console.log("  • EXPO_PUBLIC_ONBOARDING_DEV_TOOLS=1          → dev helpers on Welcome");
console.log("");
console.log("Walkthrough:");
console.log("  1. Sign in (or create account)");
console.log("  2. Welcome → About you → Your goal");
console.log("  3. Future You: Take a photo (real camera) or Choose from gallery");
console.log("  4. Training → Fuel → Paywall → Subscribe (stub) → Home");
console.log("");
console.log("Resume: kill/reopen app — draft saves your step.");
console.log("Reload: press r in this terminal if the sim looks stale.");
console.log("Reconnect: npm run connect:sim (Metro must already be running).");
console.log("");
console.log("IMPORTANT: Do not open NewYouAI from the sim home screen.");
console.log("This script deep-links to Metro automatically. Home-screen launch");
console.log("shows the native dev-client shell, not your latest JS.");
console.log("");
if (clearCache) console.log("Cache: clearing Metro bundler cache (--clear).");
console.log(`Bundle marker: ${gitShortHead(root)} (logged in this terminal only).`);
console.log("");

bootSimulatorIfNeeded();

if (isMetroRunning() && !forceRestart) {
  console.log("Metro is already running on 127.0.0.1:8082 — connecting simulator…");
  openSimulatorOnMetro();
  process.exit(0);
}

spawnSync("node", [path.join(root, "scripts", "sync-welcome-preview.mjs")], {
  cwd: root,
  stdio: "inherit",
});

if (!isDevClientInstalled()) {
  console.log("⚠ Dev client not installed on booted simulator.");
  console.log("  One-time build:");
  console.log("    cd apps/mobile && npm run eas build -- --profile development --platform ios");
  console.log("  Or local rebuild: npm run dev:onboarding:rebuild");
  console.log("");
}

if (forceRestart || !isMetroRunning()) {
  killPort(SIMULATOR_METRO_PORT);
}

const bundleMarker = gitShortHead(root);
const expoArgs = ["expo", "start", "--dev-client", "--port", String(SIMULATOR_METRO_PORT)];
if (clearCache) expoArgs.push("--clear");

const child = spawn("npx", expoArgs, {
  cwd: mobileDir,
  stdio: ["inherit", "pipe", "inherit"],
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: "127.0.0.1",
    EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "false",
    EXPO_PUBLIC_ONBOARDING_DEV_TOOLS: "1",
    EXPO_PUBLIC_BUNDLE_MARKER: bundleMarker,
  },
});

attachMetroChildHandlers(child, {
  onReady: () => {
    console.log("\n→ Connecting simulator to live Metro (127.0.0.1:8082)…\n");
    openSimulatorOnMetro();
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
