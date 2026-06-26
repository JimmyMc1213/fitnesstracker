#!/usr/bin/env node
/**
 * Start Metro for New You mobile dev-client with a packager hostname phones can reach.
 *
 * Default (LAN): same Wi‑Fi iPhone connects via Mac LAN IP — use npm run dev:mobile:phone
 * Simulator:     npm run dev:onboarding auto-opens exp+…/?url=http://127.0.0.1:8082
 * Tunnel:          npm run dev:mobile:tunnel (needs @expo/ngrok)
 */
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const port = Number(process.env.MOBILE_METRO_PORT ?? 8082);

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

const useTunnel = process.env.TUNNEL === "1" || process.argv.includes("--tunnel");
const useLan = !useTunnel;
const packagerHost = useLan ? lanIp() : undefined;
const metroUrl = `http://${packagerHost ?? "localhost"}:${port}`;
const deepLink = `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(metroUrl)}`;

if (process.env.KILL_PORT === "1") {
  killPort(port);
}

console.log("");
console.log("New You AI — Metro dev server");
console.log("─────────────────────────────");
if (useTunnel) {
  console.log("Mode: tunnel (scan QR in terminal — do not use 127.0.0.1 on a physical phone)");
} else {
  console.log(`Mode: LAN (${packagerHost}:${port})`);
  console.log(`Phone deep link: ${deepLink}`);
  console.log("Phone and Mac must be on the same Wi‑Fi.");
}
console.log("Simulator: npm run dev:onboarding connects 127.0.0.1 automatically.");
console.log("");

const expoArgs = ["expo", "start", "--dev-client", "--port", String(port)];
if (useTunnel) {
  expoArgs.push("--tunnel");
} else {
  expoArgs.push("--host", "lan");
}

const childEnv = { ...process.env };
if (packagerHost) {
  childEnv.REACT_NATIVE_PACKAGER_HOSTNAME = packagerHost;
}

const child = spawn("npx", expoArgs, {
  cwd: mobileDir,
  stdio: "inherit",
  env: childEnv,
});

child.on("exit", (code) => process.exit(code ?? 0));
