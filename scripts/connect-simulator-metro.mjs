#!/usr/bin/env node
/** Reconnect the booted iOS simulator to Metro on 127.0.0.1:8082 (no Metro restart). */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bootSimulatorIfNeeded, gitShortHead, reconnectSimulatorToMetro } from "./simulator-metro-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

bootSimulatorIfNeeded();
console.log(`Reconnecting simulator to Metro (bundle marker ${gitShortHead(root)})…`);
reconnectSimulatorToMetro();
