#!/usr/bin/env node
/**
 * One LAN Metro on :8082 — physical iPhone + iOS Simulator together.
 * Phone: http://<mac-lan-ip>:8082  ·  Simulator: 127.0.0.1:8082
 */
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  bootSimulatorIfNeeded,
  isPhoneTunnelMetroRunning,
  isSharedLanMetroRunning,
  openSimulatorOnMetro,
  SIMULATOR_METRO_PORT,
} from "./simulator-metro-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function lanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

function phoneDeepLink(ip) {
  const url = `http://${ip}:${SIMULATOR_METRO_PORT}`;
  return `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(url)}`;
}

function waitForSharedMetro(timeoutMs = 90_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (isSharedLanMetroRunning()) resolve();
      else if (Date.now() - start > timeoutMs) reject(new Error("Timed out waiting for LAN Metro on :8082"));
      else setTimeout(tick, 500);
    };
    tick();
  });
}

async function main() {
  bootSimulatorIfNeeded();

  if (isPhoneTunnelMetroRunning()) {
    spawnSync("pkill", ["-9", "-f", "cloudflared tunnel --url http://"], { stdio: "ignore" });
  }

  if (!isSharedLanMetroRunning()) {
    console.log("");
    console.log("Starting LAN Metro on :8082 (phone + simulator)…");
    console.log("");
    spawn("npm", ["run", "dev:mobile:lan"], {
      cwd: root,
      stdio: "inherit",
      detached: true,
    }).unref();
    await waitForSharedMetro();
  } else {
    console.log("LAN Metro already running on :8082.");
  }

  const ip = lanIp();
  const phoneLink = phoneDeepLink(ip);

  console.log("");
  console.log("Physical iPhone (same Wi‑Fi) — tap in Notes/Messages:");
  console.log(phoneLink);
  console.log("");
  console.log(`  Or paste manually: http://${ip}:${SIMULATOR_METRO_PORT}`);
  console.log("");

  try {
    spawnSync("pbcopy", [], { input: `${phoneLink}\n` });
    console.log("Phone deep link copied to clipboard.");
  } catch {
    /* clipboard optional */
  }

  console.log("");
  openSimulatorOnMetro();
  console.log("Simulator connecting to 127.0.0.1:8082…");
  console.log("");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
