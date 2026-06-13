import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const mobileRoot = path.resolve(__dirname, "..");

export const JAVA_HOME =
  process.env.JAVA_HOME ??
  "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home";

export function maestroEnv(extra = {}) {
  return {
    ...process.env,
    ...extra,
    JAVA_HOME,
    PATH: `${JAVA_HOME}/bin:${process.env.PATH ?? ""}:${process.env.HOME}/.maestro/bin`,
  };
}

function sleepMs(ms) {
  spawnSync("sleep", [String(Math.max(1, Math.ceil(ms / 1000)))], { stdio: "ignore" });
}

export function waitForMetro(maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const probe = spawnSync("curl", ["-sf", "-o", "/dev/null", "http://127.0.0.1:8082"], {
      stdio: "ignore",
    });
    if (probe.status === 0) return true;
    sleepMs(2000);
  }
  return false;
}

export function killMetroOn8082() {
  spawnSync("lsof", ["-ti:8082"], { stdio: "pipe" })
    .stdout?.toString()
    .trim()
    .split("\n")
    .filter(Boolean)
    .forEach((pid) => {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* ignore */
      }
    });
}

export function startMetro(extraEnv = {}) {
  killMetroOn8082();
  sleepMs(1500);

  const child = spawn("npx", ["expo", "start", "--dev-client", "--port", "8082", "-c"], {
    cwd: mobileRoot,
    stdio: "ignore",
    detached: true,
    env: maestroEnv(extraEnv),
  });
  child.unref();

  if (!waitForMetro()) {
    throw new Error("Metro failed to start on :8082");
  }

  console.log(
    "Metro ready on :8082",
    extraEnv.EXPO_PUBLIC_E2E_FITNESS_SEED ?? "(no seed)",
    extraEnv.EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING === "true" ? "skip-onboarding" : "",
  );
}
