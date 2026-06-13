import { exerciseNoteKey as coreExerciseNoteKey } from "@newyouai/core";

/** Stable key for notes tied to an exercise identity (name + optional label), not a session instance id. */
export function exerciseNoteKey(name: string, label?: string): string {
  return coreExerciseNoteKey(name, label);
}

export function getExerciseNote(notesByKey: Record<string, string>, name: string, label?: string): string {
  return notesByKey[exerciseNoteKey(name, label)]?.trim() ?? "";
}

export function normalizeExerciseNotesByKey(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof v !== "string") continue;
    const trimmed = v.trim();
    if (trimmed) out[k] = trimmed;
  }
  return out;
}

export function withExerciseNote(
  notesByKey: Record<string, string>,
  name: string,
  label: string | undefined,
  note: string,
): Record<string, string> {
  const key = exerciseNoteKey(name, label);
  const trimmed = note.trim();
  if (!trimmed) {
    if (!(key in notesByKey)) return notesByKey;
    const next = { ...notesByKey };
    delete next[key];
    return next;
  }
  if (notesByKey[key] === trimmed) return notesByKey;
  return { ...notesByKey, [key]: trimmed };
}
