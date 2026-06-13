import { exerciseNoteKey as coreExerciseNoteKey } from "@newyouai/core";

export function exerciseNoteKey(name: string, label?: string): string {
  return coreExerciseNoteKey(name, label);
}

export function getExerciseNote(notesByKey: Record<string, string>, name: string, label?: string): string {
  return notesByKey[exerciseNoteKey(name, label)]?.trim() ?? "";
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
