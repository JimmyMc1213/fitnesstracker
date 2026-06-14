#!/usr/bin/env node
/**
 * Run PWA + Expo Web side-by-side for visual parity work.
 *
 * PWA:  http://localhost:5173
 * RN:   http://localhost:8086
 *
 * Both use coach-nutrition seed, dark theme, and skip auth (local state only).
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const children = [];

function run(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[visual-parity] ${label} exited with code ${code}`);
      for (const other of children) {
        if (other !== child) other.kill("SIGTERM");
      }
      process.exit(code ?? 1);
    }
  });
  children.push(child);
  return child;
}

console.log("");
console.log("Visual parity dev — open both URLs in browser tabs:");
console.log("  PWA: http://localhost:5173");
console.log("  RN:  http://localhost:8086");
console.log("");
console.log("Seed: coach-nutrition · theme: dark · auth: bypassed (local only)");
console.log("Press Ctrl+C to stop both servers.");
console.log("");

run("pwa", "npm", ["run", "dev:visual-parity", "--workspace=@newyouai/pwa"], root);
run("mobile-web", "npm", ["run", "dev:visual-parity", "--workspace=@newyouai/mobile"], root);

process.on("SIGINT", () => {
  for (const child of children) child.kill("SIGINT");
  process.exit(0);
});
