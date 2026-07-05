#!/usr/bin/env node
/**
 * iOS Simulator + Metro with automatic deep-link connect.
 *
 * Usage (from repo root):
 *   npm run dev:mobile:client          # start Metro, or connect if already running
 *   npm run dev:mobile:client:restart  # kill :8082 and start fresh
 *   node scripts/dev-simulator-metro.mjs --connect
 *
 * Do not launch the app from the sim home screen — this script connects
 * the dev client to live JS on 127.0.0.1:8082 after Metro starts.
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  attachMetroChildHandlers,
  bootSimulatorIfNeeded,
  gitShortHead,
  isDevClientInstalled,
  isPhoneTunnelMetroRunning,
  isSharedLanMetroRunning,
  isSimulatorMetroRunning,
  isMetroRunning,
  killPort,
  openSimulatorOnMetro,
  SIMULATOR_METRO_PORT,
} from "./simulator-metro-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const clearCache = process.argv.includes("--clear") || process.env.DEV_SIMULATOR_CLEAR === "1";
const connectOnly = process.argv.includes("--connect");
const forceRestart = process.argv.includes("--restart");

const bundleMarker = gitShortHead(root);

if (connectOnly) {
  bootSimulatorIfNeeded();
  console.log(`Connecting simulator to Metro (${bundleMarker})…`);
  openSimulatorOnMetro();
  process.exit(0);
}

bootSimulatorIfNeeded();

if (isSharedLanMetroRunning() && !forceRestart) {
  console.log("");
  console.log("Metro is already running on :8082 (LAN or sim) — leaving it alone.");
  console.log("Connecting simulator… (use npm run dev:mobile:client:restart to kill and restart Metro)");
  console.log("");
  openSimulatorOnMetro();
  process.exit(0);
}

if (isPhoneTunnelMetroRunning()) {
  console.log("");
  console.log("Cloudflared tunnel Metro is on :8082 — restarting for sim + LAN phone.");
  console.log("Off-Wi‑Fi phone only: npm run dev:mobile:tunnel");
  console.log("");
}

console.log("");
console.log("New You AI — iOS Simulator + Metro");
console.log("──────────────────────────────────");
console.log("");
console.log("This script auto-connects the sim to live JS on 127.0.0.1:8082.");
console.log("Do not tap the app icon on the sim home screen — that shows the");
console.log("native dev-client shell until Metro connects.");
console.log("");
console.log("If the sim drops after a bad save, Metro auto-reloads once the bundle succeeds.");
console.log("Manual reconnect (no reset): npm run connect:sim");
console.log("");
console.log(`Bundle marker: ${bundleMarker}`);
if (clearCache) console.log("Cache: clearing Metro bundler cache (--clear).");
console.log("");

spawnSync("node", [path.join(root, "scripts", "sync-welcome-preview.mjs")], {
  cwd: root,
  stdio: "inherit",
});

if (!isDevClientInstalled()) {
  console.log("Dev client not installed on booted simulator.");
  console.log("  One-time: cd apps/mobile && npm run eas build -- --profile development --platform ios");
  console.log("  Or local:  npm run dev:onboarding:rebuild");
  console.log("");
}

if (forceRestart || isPhoneTunnelMetroRunning() || !isMetroRunning()) {
  killPort(SIMULATOR_METRO_PORT);
}

const expoArgs = ["expo", "start", "--dev-client", "--port", String(SIMULATOR_METRO_PORT)];
if (clearCache) expoArgs.push("--clear");

const child = spawn("npx", expoArgs, {
  cwd: mobileDir,
  stdio: ["inherit", "pipe", "pipe"],
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: "127.0.0.1",
    EXPO_PUBLIC_BUNDLE_MARKER: bundleMarker,
  },
});

attachMetroChildHandlers(child, {
  onReady: () => {
    console.log("\n→ Connecting simulator to live Metro (127.0.0.1:8082)…\n");
    openSimulatorOnMetro();
  },
});

child.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`\nMetro exited (${code}). Restart with: npm run dev:mobile:client\n`);
  }
  process.exit(code ?? 0);
});
