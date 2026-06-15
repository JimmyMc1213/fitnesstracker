#!/usr/bin/env node
/**
 * Start Metro for physical iPhone dev-client testing.
 * Prints LAN URLs to open on the phone after the dev client is installed.
 */
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const port = 8082;

function lanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

function killPort(p) {
  const out = spawnSync("lsof", ["-ti", `:${p}`], { encoding: "utf8" });
  for (const pid of out.stdout.trim().split(/\s+/).filter(Boolean)) {
    spawnSync("kill", ["-9", pid]);
  }
}

const ip = lanIp();
const metroUrl = `http://${ip}:${port}`;
const deepLink = `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(metroUrl)}`;

console.log("");
console.log("New You AI — iPhone dev setup");
console.log("─────────────────────────────");
console.log("");
console.log("1) One-time: install dev client on your iPhone");
console.log("   cd apps/mobile");
console.log("   npm run eas build -- --profile development-device --platform ios");
console.log("   (Run in your terminal — Apple credentials need interactive prompts.)");
console.log("   Install from the EAS build page when it finishes.");
console.log("");
console.log("2) Daily: Metro is starting below. On your iPhone:");
console.log(`   • Open dev client → connect to ${ip}:${port}`);
console.log(`   • Or paste in Safari: ${deepLink}`);
console.log("");
console.log("Phone and Mac must be on the same Wi‑Fi.");
console.log("");

killPort(port);

const child = spawn("npx", ["expo", "start", "--dev-client", "--port", String(port)], {
  cwd: mobileDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
