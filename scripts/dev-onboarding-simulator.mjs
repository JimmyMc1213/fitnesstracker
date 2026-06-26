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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const port = 8082;
const bundleId = "app.newyouai.mobile";
const clearCache = process.argv.includes("--clear") || process.env.DEV_ONBOARDING_CLEAR === "1";

function gitShortHead() {
  const out = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" });
  return out.status === 0 ? out.stdout.trim() : "unknown";
}

function simulatorMetroUrl() {
  return `http://127.0.0.1:${port}`;
}

function simulatorDeepLink() {
  return `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(simulatorMetroUrl())}`;
}

function openSimulatorOnMetro() {
  spawnSync("xcrun", ["simctl", "openurl", "booted", simulatorDeepLink()], { stdio: "inherit" });
}

function killPort(p) {
  const out = spawnSync("lsof", ["-ti", `:${p}`], { encoding: "utf8" });
  for (const pid of out.stdout.trim().split(/\s+/).filter(Boolean)) {
    spawnSync("kill", ["-9", pid]);
  }
}

function bootSimulatorIfNeeded() {
  const booted = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], { encoding: "utf8" });
  if (booted.stdout.includes("Booted")) return;

  const devices = spawnSync("xcrun", ["simctl", "list", "devices", "available"], { encoding: "utf8" });
  const match = devices.stdout.match(/iPhone[^\n]+\(([A-F0-9-]+)\)/);
  if (!match) {
    console.error("No iPhone simulator found. Install Xcode simulators first.");
    process.exit(1);
  }
  spawnSync("xcrun", ["simctl", "boot", match[1]], { stdio: "inherit" });
  spawnSync("open", ["-a", "Simulator"], { stdio: "inherit" });
}

function isDevClientInstalled() {
  const out = spawnSync("xcrun", ["simctl", "get_app_container", "booted", bundleId], {
    encoding: "utf8",
  });
  return out.status === 0;
}

console.log("");
console.log("New You AI — onboarding on iOS Simulator");
console.log("────────────────────────────────────────");
console.log("");
console.log("Env (set for this Metro session):");
console.log("  • EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING=false  → wizard after sign-in");
console.log("  • EXPO_PUBLIC_ONBOARDING_DEV_TOOLS=1          → Start fresh on Welcome");
console.log("");
console.log("Walkthrough:");
console.log("  1. Sign in (or create account)");
console.log("  2. Welcome → About you → Your goal");
console.log("  3. Future You: Take a photo (real camera) or Choose from gallery");
console.log("  4. Training → Fuel → Paywall → Subscribe (stub) → Home");
console.log("");
console.log("Resume: kill/reopen app — draft saves your step.");
console.log("Reload: press r in this terminal if the sim looks stale.");
console.log("Reset:  Welcome → Start fresh (dev), or delete app from sim home screen.");
console.log("");
console.log("Phone + sim must use THIS Metro only (stop any other npm run dev first).");
console.log("Use the NewYouAI dev client on your phone — not the Expo Go app.");
console.log("");
console.log("IMPORTANT: Do not open NewYouAI from the sim home screen.");
console.log("Always launch from this terminal (press i) so you get live code, not the");
console.log("old Jun 13 embedded bundle baked into the dev client.");
console.log("");
if (clearCache) console.log("Cache: clearing Metro bundler cache (--clear).");
console.log(`Bundle marker: ${gitShortHead()} — look for this on Welcome when dev tools are on.`);
console.log("");

bootSimulatorIfNeeded();

if (!isDevClientInstalled()) {
  console.log("⚠ Dev client not installed on booted simulator.");
  console.log("  One-time build:");
  console.log("    cd apps/mobile && npm run eas build -- --profile development --platform ios");
  console.log("  Install the .app from the EAS build page, then re-run npm run dev:onboarding");
  console.log("");
}

killPort(port);

const bundleMarker = gitShortHead();
const expoArgs = ["expo", "start", "--dev-client", "--port", String(port)];
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

let openedSimulator = false;
child.stdout?.on("data", (chunk) => {
  process.stdout.write(chunk);
  const text = chunk.toString();
  if (!openedSimulator && (text.includes("Metro waiting on") || text.includes("Logs for your project"))) {
    openedSimulator = true;
    setTimeout(() => {
      console.log("\n→ Connecting simulator to live Metro (127.0.0.1:8082)…\n");
      openSimulatorOnMetro();
    }, 1500);
  }
});

child.on("exit", (code) => process.exit(code ?? 0));
