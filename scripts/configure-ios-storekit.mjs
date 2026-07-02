#!/usr/bin/env node
/**
 * Copy StoreKit config into ios/, wire Xcode scheme, and sync into the booted
 * simulator's Octane container (CLI workaround — Xcode ▶ Run does this automatically).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const iosDir = path.join(mobileDir, "ios");
const bundleId = "app.newyouai.mobile";
const sourceStorekit = path.join(mobileDir, "storekit", "NewYouAI.storekit");
const destStorekit = path.join(iosDir, "NewYouAI.storekit");
const schemePath = path.join(
  iosDir,
  "NewYouAI.xcodeproj",
  "xcshareddata",
  "xcschemes",
  "NewYouAI.xcscheme",
);

const storekitRef = `<StoreKitConfigurationFileReference
         identifier = "../../NewYouAI.storekit">
      </StoreKitConfigurationFileReference>`;

function bootedSimulatorUdid() {
  const out = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], { encoding: "utf8" });
  const match = out.stdout.match(/\(([A-F0-9-]+)\)\s*\(Booted\)/);
  return match?.[1] ?? null;
}

function syncStorekitToSimulator(storekitPath) {
  const udid = bootedSimulatorUdid();
  if (!udid) {
    console.log("configure-ios-storekit: no booted simulator — skip Octane sync");
    return;
  }

  const appGroupRoot = path.join(
    process.env.HOME ?? "",
    "Library/Developer/CoreSimulator/Devices",
    udid,
    "data/Containers/Shared/AppGroup",
  );
  if (!fs.existsSync(appGroupRoot)) return;

  let synced = false;
  for (const entry of fs.readdirSync(appGroupRoot)) {
    const octaneRoot = path.join(
      appGroupRoot,
      entry,
      "Documents/Persistence/Octane",
    );
    if (!fs.existsSync(octaneRoot)) continue;

    const targetDir = path.join(octaneRoot, bundleId);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(storekitPath, path.join(targetDir, "Configuration.storekit"));
    synced = true;
    console.log(`configure-ios-storekit: synced StoreKit into simulator Octane (${bundleId})`);
    break;
  }

  if (!synced) {
    console.warn("configure-ios-storekit: Octane folder not found — press ▶ Run in Xcode once");
  }
}

function main() {
  if (!fs.existsSync(iosDir)) {
    console.log("configure-ios-storekit: ios/ not found — run expo prebuild first");
    return;
  }
  if (!fs.existsSync(sourceStorekit)) {
    console.error("configure-ios-storekit: missing", sourceStorekit);
    process.exit(1);
  }

  fs.copyFileSync(sourceStorekit, destStorekit);
  console.log("configure-ios-storekit: copied StoreKit config to ios/NewYouAI.storekit");

  if (fs.existsSync(schemePath)) {
    let scheme = fs.readFileSync(schemePath, "utf8");
    if (!scheme.includes("StoreKitConfigurationFileReference")) {
      const anchor = "</BuildableProductRunnable>";
      if (scheme.includes(anchor)) {
        scheme = scheme.replace(anchor, `${anchor}\n      ${storekitRef}`);
        fs.writeFileSync(schemePath, scheme);
        console.log("configure-ios-storekit: wired StoreKit config into NewYouAI scheme");
      }
    } else {
      console.log("configure-ios-storekit: scheme already references StoreKit config");
    }
  }

  syncStorekitToSimulator(destStorekit);
}

main();
