import type { AppState, WaterLogEntry } from "./types";

export const DEFAULT_WATER_DAILY_TARGET_OZ = 64;

export const WATER_QUICK_ADD_OZ = [8, 16] as const;

export const WATER_TARGET_PRESETS_OZ = [48, 64, 80, 96] as const;

const FL_OZ_TO_L = 0.0295735;

export function normalizeWaterDailyTargetOz(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_WATER_DAILY_TARGET_OZ;
  return Math.round(Math.min(256, Math.max(16, n)));
}

export function normalizeWaterLogEntry(raw: unknown): WaterLogEntry | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id.trim()) return null;
  const amountOz = Number(o.amountOz);
  const loggedAtMs = Number(o.loggedAtMs);
  if (!Number.isFinite(amountOz) || amountOz <= 0 || amountOz > 128) return null;
  if (!Number.isFinite(loggedAtMs) || loggedAtMs <= 0) return null;
  return { id: o.id, amountOz, loggedAtMs };
}

export function normalizeWaterLogByDay(raw: unknown): Record<string, WaterLogEntry[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, WaterLogEntry[]> = {};
  for (const [day, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Array.isArray(v)) continue;
    const entries: WaterLogEntry[] = [];
    for (const item of v) {
      const entry = normalizeWaterLogEntry(item);
      if (entry) entries.push(entry);
    }
    if (entries.length) out[day] = entries;
  }
  return out;
}

export function mergeWaterLogByDay(
  local: Record<string, WaterLogEntry[]>,
  remote: Record<string, WaterLogEntry[]>,
): Record<string, WaterLogEntry[]> {
  const days = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const out: Record<string, WaterLogEntry[]> = {};
  for (const d of days) {
    const la = local[d] ?? [];
    const lb = remote[d] ?? [];
    const byId = new Map<string, WaterLogEntry>();
    for (const it of [...la, ...lb]) byId.set(it.id, it);
    out[d] = [...byId.values()];
  }
  return out;
}

export function totalWaterOzForDateKey(waterLogByDay: Record<string, WaterLogEntry[]>, dateKey: string): number {
  const entries = waterLogByDay[dateKey] ?? [];
  return entries.reduce((sum, e) => sum + e.amountOz, 0);
}

export function appendWaterLogEntry(state: AppState, dateKey: string, amountOz: number): AppState {
  if (!Number.isFinite(amountOz) || amountOz <= 0 || amountOz > 128) return state;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const entry: WaterLogEntry = { id, amountOz, loggedAtMs: Date.now() };
  const prev = state.waterLogByDay[dateKey] ?? [];
  return {
    ...state,
    waterLogByDay: {
      ...state.waterLogByDay,
      [dateKey]: [...prev, entry],
    },
  };
}

export function formatWaterOz(oz: number): string {
  return `${Math.round(oz)} oz`;
}

export function formatWaterLitersFromOz(oz: number): string {
  const liters = oz * FL_OZ_TO_L;
  return `≈ ${liters.toFixed(1)} L`;
}
