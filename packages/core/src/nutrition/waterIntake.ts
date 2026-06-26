import type { AppState, VolumeUnit, WaterLogEntry } from "@newyouai/types";

export const DEFAULT_WATER_DAILY_TARGET_OZ = 64;

export const WATER_QUICK_ADD_OZ = [8, 16] as const;

export const WATER_QUICK_ADD_L = [0.25, 0.5] as const;

export const WATER_TARGET_PRESETS_OZ = [48, 64, 80, 96] as const;

export const WATER_TARGET_PRESETS_L = [1.5, 2, 2.5, 3] as const;

export const FL_OZ_TO_L = 0.0295735;
export const L_TO_FL_OZ = 1 / FL_OZ_TO_L;

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

export function removeWaterLogEntry(state: AppState, dateKey: string, entryId: string): AppState {
  const prev = state.waterLogByDay[dateKey] ?? [];
  const next = prev.filter((e) => e.id !== entryId);
  if (next.length === prev.length) return state;
  const waterLogByDay = { ...state.waterLogByDay };
  if (next.length) waterLogByDay[dateKey] = next;
  else delete waterLogByDay[dateKey];
  return { ...state, waterLogByDay };
}

export function clearWaterLogForDateKey(state: AppState, dateKey: string): AppState {
  if (!state.waterLogByDay[dateKey]?.length) return state;
  const waterLogByDay = { ...state.waterLogByDay };
  delete waterLogByDay[dateKey];
  return { ...state, waterLogByDay };
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
  return formatWaterVolume(oz, "oz");
}

export function formatWaterLitersFromOz(oz: number): string {
  return formatWaterVolumeAlt(oz, "oz");
}

export function parseVolumeToOz(value: number, unit: VolumeUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return unit === "L" ? value * L_TO_FL_OZ : value;
}

export function formatVolumeFromOz(oz: number, unit: VolumeUnit): string {
  if (!Number.isFinite(oz)) return "";
  if (unit === "L") return (oz * FL_OZ_TO_L).toFixed(1);
  return String(Math.round(oz));
}

export function formatWaterVolume(oz: number, unit: VolumeUnit): string {
  if (!Number.isFinite(oz)) return "—";
  if (unit === "L") return `${(oz * FL_OZ_TO_L).toFixed(1)} L`;
  return `${Math.round(oz)} oz`;
}

export function formatWaterVolumeAlt(oz: number, unit: VolumeUnit): string {
  if (!Number.isFinite(oz)) return "—";
  if (unit === "L") return `≈ ${Math.round(oz)} oz`;
  return `≈ ${(oz * FL_OZ_TO_L).toFixed(1)} L`;
}

export function waterQuickAddPresets(unit: VolumeUnit): readonly number[] {
  return unit === "L" ? WATER_QUICK_ADD_L : WATER_QUICK_ADD_OZ;
}

export function waterTargetPresets(unit: VolumeUnit): readonly number[] {
  return unit === "L" ? WATER_TARGET_PRESETS_L : WATER_TARGET_PRESETS_OZ;
}

export function formatWaterPreset(value: number, unit: VolumeUnit): string {
  if (unit === "L") return `${value} L`;
  return `${value} oz`;
}
