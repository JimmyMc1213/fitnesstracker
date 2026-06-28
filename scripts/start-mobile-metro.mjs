#!/usr/bin/env node
/**
 * Start Metro for New You mobile dev-client.
 *
 * Phone (default for npm run dev:mobile:phone):
 *   cloudflared HTTPS tunnel — works on physical iPhone without same Wi‑Fi.
 * Simulator (npm run dev:onboarding):
 *   127.0.0.1:8082 — opened automatically.
 * LAN (--lan):
 *   http://<mac-lan-ip>:8082 — same Wi‑Fi only; often blocked on iOS.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileDir = path.join(root, "apps", "mobile");
const port = Number(process.env.MOBILE_METRO_PORT ?? 8082);
const cloudflaredLog = path.join(os.tmpdir(), "newyou-cloudflared.log");

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
    spawnSync("kill", ["-9", pid], { stdio: "ignore" });
  }
}

function killCloudflared() {
  spawnSync("pkill", ["-9", "-f", "cloudflared tunnel --url http://127.0.0.1"], { stdio: "ignore" });
}

function copyToClipboard(text) {
  try {
    spawnSync("pbcopy", [], { input: `${text}\n` });
    return true;
  } catch {
    return false;
  }
}

function parseCloudflaredUrl(text) {
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  return match?.[0] ?? null;
}

function buildDeepLink(metroUrl) {
  return `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(metroUrl)}`;
}

function ensureCloudflaredInstalled() {
  const which = spawnSync("which", ["cloudflared"], { encoding: "utf8" });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();

  console.error("");
  console.error("cloudflared is required for phone dev (HTTPS tunnel to Metro).");
  console.error("Install:  brew install cloudflared");
  console.error("");
  process.exit(1);
}

function waitForCloudflaredUrl(child, timeoutMs = 90_000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let logText = "";
    fs.writeFileSync(cloudflaredLog, "");

    const finish = (url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      resolve(url);
    };

    const fail = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      reject(err);
    };

    const ingest = (chunk) => {
      const text = chunk.toString();
      logText += text;
      fs.appendFileSync(cloudflaredLog, text);
      const url = parseCloudflaredUrl(text) ?? parseCloudflaredUrl(logText);
      if (url) finish(url);
    };

    child.stdout?.on("data", ingest);
    child.stderr?.on("data", ingest);
    child.on("error", fail);
    child.on("exit", (code) => {
      if (!settled) {
        const url = parseCloudflaredUrl(logText);
        if (url) finish(url);
        else fail(new Error(`cloudflared exited (${code ?? "unknown"})`));
      }
    });

    const poll = setInterval(() => {
      try {
        const fromFile = fs.readFileSync(cloudflaredLog, "utf8");
        const url = parseCloudflaredUrl(fromFile);
        if (url) finish(url);
      } catch {
        /* log not ready yet */
      }
    }, 500);

    const timer = setTimeout(() => {
      const url = parseCloudflaredUrl(logText) ?? parseCloudflaredUrl(fs.readFileSync(cloudflaredLog, "utf8"));
      if (url) finish(url);
      else fail(new Error("Timed out waiting for cloudflared HTTPS URL"));
    }, timeoutMs);
  });
}

async function startCloudflaredTunnel() {
  ensureCloudflaredInstalled();
  killCloudflared();

  const child = spawn(
    "cloudflared",
    ["tunnel", "--url", `http://127.0.0.1:${port}`, "--no-autoupdate"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  const url = await waitForCloudflaredUrl(child);
  return { url, hostname: new URL(url).hostname, child };
}

const usePhoneTunnel =
  process.env.PHONE === "1" ||
  process.argv.includes("--phone") ||
  (process.env.TUNNEL === "1" && !process.argv.includes("--lan"));
const useLan = process.env.LAN === "1" || process.argv.includes("--lan");
const usePhone = usePhoneTunnel;
const clearCache = process.env.CLEAR === "1" || process.argv.includes("--clear");

if (process.env.KILL_PORT === "1") {
  killPort(port);
  if (usePhone) killCloudflared();
}

let cloudflaredChild;
let metroChild;
let metroUrl;
let packagerHost;

if (usePhone) {
  console.log("");
  console.log("New You AI — Metro for physical iPhone");
  console.log("──────────────────────────────────────");
  console.log("Starting HTTPS tunnel (cloudflared)…");
  console.log("");

  const tunnel = await startCloudflaredTunnel();
  cloudflaredChild = tunnel.child;
  metroUrl = tunnel.url;
  packagerHost = tunnel.hostname;

  console.log(`Tunnel:  ${metroUrl}`);
  console.log("Metro will bind locally; phone loads JS over HTTPS.");
} else {
  packagerHost = lanIp();
  metroUrl = `http://${packagerHost}:${port}`;

  console.log("");
  console.log("New You AI — Metro dev server");
  console.log("─────────────────────────────");
  console.log(`Mode: LAN (${packagerHost}:${port})`);
  console.log("Phone and Mac must be on the same Wi‑Fi.");
}

const deepLink = buildDeepLink(metroUrl);

console.log("");
console.log("Phone deep link:");
console.log(deepLink);
console.log("");
console.log("How to connect:");
console.log("  1. Force-quit New You on your iPhone if it is open");
console.log("  2. Paste the link above into Notes or Messages and TAP it");
console.log("  3. Use the New You dev client — not Expo Go");
console.log("");
console.log("Simulator: npm run dev:onboarding");
console.log("");

if (copyToClipboard(deepLink)) {
  console.log("Deep link copied to clipboard.");
  console.log("");
}

const expoArgs = ["expo", "start", "--dev-client", "--port", String(port), "--host", "lan"];
if (clearCache) expoArgs.push("--clear");

const childEnv = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: packagerHost,
};

metroChild = spawn("npx", expoArgs, {
  cwd: mobileDir,
  stdio: "inherit",
  env: childEnv,
});

function shutdown(code = 0) {
  cloudflaredChild?.kill("SIGTERM");
  metroChild?.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

metroChild.on("exit", (code) => {
  cloudflaredChild?.kill("SIGTERM");
  process.exit(code ?? 0);
});

// Print QR after Metro is up so the terminal isn't noisy during bundler startup.
if (usePhone) {
  setTimeout(() => {
    console.log("");
    console.log("Scan this QR code with your iPhone camera (opens dev client):");
    console.log("");
    spawnSync("npx", ["--yes", "qrcode-terminal", deepLink], { stdio: "inherit" });
    console.log("");
  }, 12_000);
}
