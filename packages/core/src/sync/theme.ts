import type { AppTheme } from "@newyouai/types";

export function normalizeAppTheme(raw: unknown): AppTheme {
  return raw === "light" ? "light" : "dark";
}
