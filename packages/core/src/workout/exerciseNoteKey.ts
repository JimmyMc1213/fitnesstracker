/** Stable key for notes tied to an exercise identity (name + optional label), not a session instance id. */
export function exerciseNoteKey(name: string, label?: string): string {
  const n = name.trim().toLowerCase();
  const l = (label ?? "").trim().toLowerCase();
  return l ? `${n}\u0000${l}` : n;
}
