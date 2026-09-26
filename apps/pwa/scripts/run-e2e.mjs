/**
 * Launch Playwright with a browser path that does not depend on npm's INIT_CWD.
 *
 * Playwright resolves a relative PLAYWRIGHT_BROWSERS_PATH against INIT_CWD
 * (the directory where npm was invoked), not the package directory. CI runs
 * `npm run test:e2e --workspace=@newyouai/pwa` from the repo root, so a
 * relative `../../.playwright-browsers` points outside the checkout and
 * misses the browsers installed under the repo.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultBrowsersPath = path.resolve(appRoot, "../../.playwright-browsers");

function browsersPath() {
  const fromEnv = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!fromEnv) return defaultBrowsersPath;
  if (path.isAbsolute(fromEnv)) return fromEnv;
  return path.resolve(process.env.INIT_CWD || process.cwd(), fromEnv);
}

const require = createRequire(import.meta.url);
const cli = require.resolve("@playwright/test/cli");
const child = spawn(process.execPath, [cli, "test", ...process.argv.slice(2)], {
  cwd: appRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: browsersPath(),
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
