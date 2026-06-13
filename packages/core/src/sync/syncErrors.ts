/** Map sync/storage failures to user-facing copy (PWA parity). */
export function userFacingSyncError(e: unknown, fallback: string): string {
  if (e instanceof SyntaxError) return "Saved data could not be read. Using your local defaults.";
  const msg = e instanceof Error ? e.message : fallback;
  if (/unicode escape|json\.parse|syntaxerror|unexpected token/i.test(msg)) {
    return "Saved data could not be read. Using your local defaults.";
  }
  return msg || fallback;
}

/** Format last sync timestamp for settings UI. */
export function formatSyncedLabel(ts: number | null): string | null {
  if (ts == null) return null;
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}
