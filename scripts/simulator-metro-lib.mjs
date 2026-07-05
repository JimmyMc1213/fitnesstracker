import { spawnSync } from "node:child_process";

export const SIMULATOR_METRO_PORT = 8082;
export const SIMULATOR_BUNDLE_ID = "app.newyouai.mobile";

export function gitShortHead(root) {
  const out = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" });
  return out.status === 0 ? out.stdout.trim() : "unknown";
}

export function simulatorMetroUrl(port = SIMULATOR_METRO_PORT) {
  return `http://127.0.0.1:${port}`;
}

export function simulatorDeepLink(port = SIMULATOR_METRO_PORT) {
  const url = simulatorMetroUrl(port);
  return `exp+newyouai-mobile://expo-development-client/?url=${encodeURIComponent(url)}`;
}

export function isMetroRunning(port = SIMULATOR_METRO_PORT) {
  const out = spawnSync("curl", ["-sf", `${simulatorMetroUrl(port)}/status`], { encoding: "utf8" });
  return out.status === 0 && out.stdout.includes("running");
}

export function getMetroPackagerHostname(port = SIMULATOR_METRO_PORT) {
  const out = spawnSync("lsof", ["-ti", `:${port}`], { encoding: "utf8" });
  const pid = out.stdout.trim().split(/\s+/).filter(Boolean)[0];
  if (!pid) return null;
  const ps = spawnSync("ps", ["eww", "-p", pid], { encoding: "utf8" });
  const match = ps.stdout.match(/REACT_NATIVE_PACKAGER_HOSTNAME=(\S+)/);
  return match?.[1] ?? null;
}

export function isSimulatorMetroRunning(port = SIMULATOR_METRO_PORT) {
  if (!isMetroRunning(port)) return false;
  const hostname = getMetroPackagerHostname(port);
  return hostname === "127.0.0.1" || hostname === "localhost";
}

/** LAN Metro on :8082 — phone (Wi‑Fi) and simulator can share this instance. */
export function isSharedLanMetroRunning(port = SIMULATOR_METRO_PORT) {
  if (!isMetroRunning(port)) return false;
  const hostname = getMetroPackagerHostname(port);
  if (!hostname || hostname.includes("trycloudflare.com")) return false;
  return hostname === "127.0.0.1" || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
}

export function isPhoneTunnelMetroRunning(port = SIMULATOR_METRO_PORT) {
  if (!isMetroRunning(port)) return false;
  const hostname = getMetroPackagerHostname(port);
  return Boolean(hostname?.includes("trycloudflare.com"));
}

export function killCloudflared() {
  spawnSync("pkill", ["-9", "-f", "cloudflared tunnel --url http://"], { stdio: "ignore" });
}

/** Soft reload — keeps JS state when the dev client is still connected. */
export function reloadMetroClients(port = SIMULATOR_METRO_PORT) {
  spawnSync("curl", ["-sf", "-X", "POST", `${simulatorMetroUrl(port)}/reload`], { encoding: "utf8" });
}

export function openSimulatorOnMetro(port = SIMULATOR_METRO_PORT) {
  return spawnSync("xcrun", ["simctl", "openurl", "booted", simulatorDeepLink(port)], {
    stdio: "inherit",
  });
}

/** Reconnect without restarting Metro: soft reload first, then deep-link fallback. */
export function reconnectSimulatorToMetro(port = SIMULATOR_METRO_PORT) {
  if (!isMetroRunning(port)) {
    console.error(`Metro is not running on ${simulatorMetroUrl(port)}. Start it with: npm run dev:mobile:client`);
    process.exit(1);
  }
  reloadMetroClients(port);
  return openSimulatorOnMetro(port);
}

export function killPort(port) {
  const out = spawnSync("lsof", ["-ti", `:${port}`], { encoding: "utf8" });
  for (const pid of out.stdout.trim().split(/\s+/).filter(Boolean)) {
    spawnSync("kill", ["-9", pid]);
  }
}

export function bootSimulatorIfNeeded() {
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

export function isDevClientInstalled(bundleId = SIMULATOR_BUNDLE_ID) {
  const out = spawnSync("xcrun", ["simctl", "get_app_container", "booted", bundleId], {
    encoding: "utf8",
  });
  return out.status === 0;
}

const BUNDLE_FAILED =
  /Bundling failed|Unable to resolve|SyntaxError|TransformError|ERROR\s+\[|TypeError: Cannot read/i;

/**
 * Forward Metro stdout, connect once when ready, and auto-reload the sim after
 * a failed bundle is followed by a successful one (common during rapid edits).
 */
export function attachMetroChildHandlers(child, { onReady, port = SIMULATOR_METRO_PORT } = {}) {
  let connected = false;
  let bundleFailed = false;
  let readyTimer = null;
  let recoveryTimer = null;

  // Metro prints "ready" banners to stdout but bundling errors (SyntaxError,
  // Unable to resolve, TransformError) to stderr. Watch BOTH so a failed bundle
  // is detected — otherwise the recover-and-reload below never fires and the
  // sim stays stranded on the error/stale screen after a save.
  const ingest = (chunk) => {
    const text = chunk.toString();

    if (
      !connected &&
      onReady &&
      (text.includes("Metro waiting on") ||
        text.includes("Waiting on http://localhost") ||
        text.includes("Logs for your project"))
    ) {
      connected = true;
      clearTimeout(readyTimer);
      readyTimer = setTimeout(onReady, 1500);
    }

    if (BUNDLE_FAILED.test(text)) {
      bundleFailed = true;
    }

    if (/\biOS Bundled\b/.test(text) && bundleFailed) {
      bundleFailed = false;
      clearTimeout(recoveryTimer);
      recoveryTimer = setTimeout(() => {
        console.log("\n↻ Bundle recovered — reloading simulator (Metro stays running)…\n");
        reloadMetroClients(port);
      }, 500);
    }
  };

  child.stdout?.on("data", (chunk) => {
    process.stdout.write(chunk);
    ingest(chunk);
  });

  child.stderr?.on("data", (chunk) => {
    process.stderr.write(chunk);
    ingest(chunk);
  });
}

/** @deprecated Use attachMetroChildHandlers */
export function waitForMetroReady(child, onReady) {
  attachMetroChildHandlers(child, { onReady });
}
