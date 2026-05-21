import { exerciseNoteKey } from "./exerciseNotes";
import { formatSetWeight, weightUnitLabel } from "./unitPreferences";
import type { CompletedWorkoutSession, ExerciseSessionSnapshot, WeightUnit } from "./types";

export type PersonalRecordHistoryEntry = {
  dayKey: string;
  endedAtMs: number;
  bestWeight: number;
  bestReps: number;
  isPr: boolean;
};

export type PersonalRecordExerciseRow = {
  key: string;
  displayName: string;
  displayLabel?: string;
  bestWeight: number;
  bestReps: number;
  bestDateKey: string;
  bestEndedAtMs: number;
  history: PersonalRecordHistoryEntry[];
};

function isBetterSet(w: number, r: number, bestW: number, bestR: number): boolean {
  if (w > bestW) return true;
  if (w === bestW && r > bestR) return true;
  if (w < bestW && r > bestR) return true;
  return false;
}

function titleCaseWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseExerciseNoteKey(key: string): { namePart: string; label?: string } {
  const idx = key.indexOf("\u0000");
  if (idx >= 0) {
    const label = key.slice(idx + 1);
    return { namePart: key.slice(0, idx), label: label || undefined };
  }
  return { namePart: key };
}

function resolveDisplayNames(
  key: string,
  workoutHistory: CompletedWorkoutSession[],
): { name: string; label?: string } {
  for (const session of workoutHistory) {
    for (const ex of session.exercises) {
      if (exerciseNoteKey(ex.name, ex.label) === key) {
        return { name: ex.name, label: ex.label };
      }
    }
  }
  const { namePart, label } = parseExerciseNoteKey(key);
  return { name: titleCaseWords(namePart), label: label ? titleCaseWords(label) : undefined };
}

function annotatePrHistory(snapshots: ExerciseSessionSnapshot[]): PersonalRecordHistoryEntry[] {
  const sorted = [...snapshots].sort((a, b) => a.endedAtMs - b.endedAtMs);
  let maxWeight = 0;
  let maxReps = 0;
  const out: PersonalRecordHistoryEntry[] = [];

  for (const snap of sorted) {
    const hadPrior = maxWeight > 0 || maxReps > 0;
    const isPr =
      hadPrior &&
      (snap.bestWeight > maxWeight ||
        (snap.bestWeight === maxWeight && snap.bestReps > maxReps) ||
        (snap.bestWeight < maxWeight && snap.bestReps > maxReps));

    out.push({
      dayKey: snap.dayKey,
      endedAtMs: snap.endedAtMs,
      bestWeight: snap.bestWeight,
      bestReps: snap.bestReps,
      isPr,
    });

    const prevW = maxWeight;
    const prevR = maxReps;
    maxWeight = Math.max(prevW, snap.bestWeight);
    maxReps = Math.max(prevR, snap.bestReps);
    if (snap.bestWeight === prevW && snap.bestReps > prevR) maxReps = snap.bestReps;
    if (snap.bestWeight > prevW) {
      maxWeight = snap.bestWeight;
      maxReps = Math.max(prevR, snap.bestReps);
    }
  }

  return out.reverse();
}

function overallBest(snapshots: ExerciseSessionSnapshot[]): ExerciseSessionSnapshot | null {
  let best: ExerciseSessionSnapshot | null = null;
  for (const snap of snapshots) {
    if (!best || isBetterSet(snap.bestWeight, snap.bestReps, best.bestWeight, best.bestReps)) {
      best = snap;
    }
  }
  return best;
}

export function formatPersonalRecordSet(wLbs: number, reps: number, unit: WeightUnit): string {
  if (wLbs > 0) {
    return `${formatSetWeight(wLbs, unit)} ${weightUnitLabel(unit)} × ${reps}`;
  }
  return `${reps} rep${reps === 1 ? "" : "s"}`;
}

export function formatRecordHeroParts(
  wLbs: number,
  reps: number,
  unit: WeightUnit,
): { primary: string; primaryUnit: string; secondary: string | null } {
  if (wLbs > 0) {
    return {
      primary: formatSetWeight(wLbs, unit),
      primaryUnit: weightUnitLabel(unit),
      secondary: `× ${reps}`,
    };
  }
  return {
    primary: String(reps),
    primaryUnit: reps === 1 ? "rep" : "reps",
    secondary: null,
  };
}

export function formatPersonalRecordDate(dayKey: string, endedAtMs: number): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dayKey)
    ? new Date(`${dayKey}T12:00:00`)
    : new Date(endedAtMs);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function buildPersonalRecordsBoard(
  exerciseSessionHistoryByKey: Record<string, ExerciseSessionSnapshot[]>,
  workoutHistory: CompletedWorkoutSession[],
): PersonalRecordExerciseRow[] {
  const rows: PersonalRecordExerciseRow[] = [];

  for (const [key, snapshots] of Object.entries(exerciseSessionHistoryByKey)) {
    if (!snapshots?.length) continue;
    const bestSnap = overallBest(snapshots);
    if (!bestSnap) continue;

    const { name, label } = resolveDisplayNames(key, workoutHistory);
    const history = annotatePrHistory(snapshots);

    rows.push({
      key,
      displayName: name,
      displayLabel: label,
      bestWeight: bestSnap.bestWeight,
      bestReps: bestSnap.bestReps,
      bestDateKey: bestSnap.dayKey,
      bestEndedAtMs: bestSnap.endedAtMs,
      history,
    });
  }

  return rows.sort((a, b) => {
    if (b.bestWeight !== a.bestWeight) return b.bestWeight - a.bestWeight;
    if (b.bestReps !== a.bestReps) return b.bestReps - a.bestReps;
    return a.displayName.localeCompare(b.displayName);
  });
}
