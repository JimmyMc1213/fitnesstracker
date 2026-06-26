#!/usr/bin/env node
/**
 * Nuclear fix: build + install a fresh local dev client on the iOS simulator.
 * Use when the EAS dev client keeps showing an old embedded bundle.
 *
 *   npm run dev:onboarding:rebuild
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const port = 8082;
const bundleId = "app.newyouai.mobile";

function killPort(p) {
  const out = spawnSync("lsof", ["-ti", `:${p}`], { encoding: "utf8" });
  for (const pid of out.stdout.trim().split(/\s+/).filter(Boolean)) {
    spawnSync("kill", ["-9", pid]);
  }
}

function gitShortHead() {
  const out = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" });
  return out.status === 0 ? out.stdout.trim() : "unknown";
}

function bootSimulatorIfNeeded() {
  const booted = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], { encoding: "utf8" });
  if (booted.stdout.includes("Booted")) return;
  const devices = spawnSync("xcrun", ["simctl", "list", "devices", "available"], { encoding: "utf8" });
  const match = devices.stdout.match(/iPhone[^\n]+\(([A-F0-9-]+)\)/);
  if (!match) {
    console.error("No iPhone simulator found.");
    process.exit(1);
  }
  spawnSync("xcrun", ["simctl", "boot", match[1]], { stdio: "inherit" });
  spawnSync("open", ["-a", "Simulator"], { stdio: "inherit" });
}

console.log("");
console.log("Rebuilding local dev client for iOS Simulator (live Metro, no stale bundle)");
console.log(`Bundle marker: ${gitShortHead()}`);
console.log("");

bootSimulatorIfNeeded();
spawnSync("xcrun", ["simctl", "uninstall", "booted", bundleId], { stdio: "inherit" });
killPort(port);

const marker = gitShortHead();
const child = spawn(
  "npx",
  ["expo", "run:ios", "--port", String(port)],
  {
    cwd: mobileDir,
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "false",
      EXPO_PUBLIC_ONBOARDING_DEV_TOOLS: "1",
      EXPO_PUBLIC_BUNDLE_MARKER: marker,
    },
  },
);

child.on("exit", (code) => process.exit(code ?? 0));
