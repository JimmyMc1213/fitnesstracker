#!/usr/bin/env node
/** @deprecated Use npm run dev:mobile:phone from repo root (scripts/start-mobile-metro.mjs). */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "start-mobile-metro.mjs");
const child = spawn(process.execPath, [script], {
  stdio: "inherit",
  env: { ...process.env, KILL_PORT: "1" },
});
child.on("exit", (code) => process.exit(code ?? 0));
