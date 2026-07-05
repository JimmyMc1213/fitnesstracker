#!/usr/bin/env node
/**
 * Keep the welcome phone mockup portrait in sync between web marketing and RN.
 * Source of truth: apps/web/public/assets/futureyou-welcome-preview.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "apps/web/public/assets/futureyou-welcome-preview.png");
const target = path.join(root, "apps/mobile/assets/images/futureyou-welcome-preview.png");

if (!fs.existsSync(source)) {
  console.error(`Missing source asset: ${source}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });

const needsCopy =
  !fs.existsSync(target) || fs.statSync(source).mtimeMs > fs.statSync(target).mtimeMs;

if (needsCopy) {
  fs.copyFileSync(source, target);
  console.log(`Synced welcome preview → ${path.relative(root, target)}`);
}
