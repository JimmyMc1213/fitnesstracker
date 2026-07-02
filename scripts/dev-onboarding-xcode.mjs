#!/usr/bin/env node
/**
 * Full simulator paywall setup: StoreKit sync, xcodebuild, install, Metro.
 * Works without pressing ▶ in Xcode (Octane sync is done manually by configure script).
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const iosDir = path.join(mobileDir, "ios");
const workspace = path.join(iosDir, "NewYouAI.xcworkspace");
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

function bootedUdid() {
  const out = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], { encoding: "utf8" });
  const match = out.stdout.match(/\(([A-F0-9-]+)\)\s*\(Booted\)/);
  return match?.[1] ?? null;
}

function findBuiltApp() {
  const derived = path.join(process.env.HOME ?? "", "Library/Developer/Xcode/DerivedData");
  if (!fs.existsSync(derived)) return null;
  for (const dir of fs.readdirSync(derived)) {
    if (!dir.startsWith("NewYouAI-")) continue;
    const app = path.join(
      derived,
      dir,
      "Build/Products/Debug-iphonesimulator/NewYouAI.app",
    );
    if (fs.existsSync(app)) return app;
  }
  return null;
}

spawnSync("node", [path.join(root, "scripts", "configure-ios-storekit.mjs")], {
  cwd: root,
  stdio: "inherit",
});

const udid = bootedUdid();
if (!udid) {
  spawnSync("open", ["-a", "Simulator"], { stdio: "inherit" });
  spawnSync("xcrun", ["simctl", "boot", "5369A9C3-9B05-4F0B-A81D-DF867E6F775F"], { stdio: "inherit" });
}

const destUdid = bootedUdid() ?? "5369A9C3-9B05-4F0B-A81D-DF867E6F775F";

console.log("");
console.log("Building + installing with StoreKit config for simulator paywall test");
console.log(`Bundle marker: ${gitShortHead()}`);
console.log("");

killPort(port);

const build = spawnSync(
  "xcodebuild",
  [
    "-workspace", workspace,
    "-scheme", "NewYouAI",
    "-configuration", "Debug",
    "-destination", `platform=iOS Simulator,id=${destUdid}`,
    "-allowProvisioningUpdates",
    "build",
  ],
  { cwd: iosDir, stdio: "inherit" },
);

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

spawnSync("node", [path.join(root, "scripts", "configure-ios-storekit.mjs")], {
  cwd: root,
  stdio: "inherit",
});

const app = findBuiltApp();
if (!app) {
  console.error("Could not find NewYouAI.app in DerivedData after build.");
  process.exit(1);
}

spawnSync("xcrun", ["simctl", "uninstall", "booted", bundleId], { stdio: "inherit" });
spawnSync("xcrun", ["simctl", "install", "booted", app], { stdio: "inherit" });
spawnSync("xcrun", ["simctl", "launch", "booted", bundleId], { stdio: "inherit" });

const metroUrl = `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(`http://127.0.0.1:${port}`)}`;
setTimeout(() => {
  spawnSync("xcrun", ["simctl", "openurl", "booted", metroUrl], { stdio: "inherit" });
}, 1500);

console.log("");
console.log("App installed on simulator. Metro starting on port 8082…");
console.log("Sign in and walk through onboarding to the paywall.");
console.log("");

const child = spawn(
  "npx",
  ["expo", "start", "--dev-client", "--port", String(port), "--clear"],
  {
    cwd: mobileDir,
    stdio: "inherit",
    env: {
      ...process.env,
      REACT_NATIVE_PACKAGER_HOSTNAME: "127.0.0.1",
      EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING: "false",
      EXPO_PUBLIC_ONBOARDING_DEV_TOOLS: "1",
      EXPO_PUBLIC_BUNDLE_MARKER: gitShortHead(),
    },
  },
);

child.on("exit", (code) => process.exit(code ?? 0));
