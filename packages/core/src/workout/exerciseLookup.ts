import exerciseExpansion from "./exerciseExpansion";
import exerciseLibrary, { type Exercise } from "./exerciseLibrary";

/** Program library first, then browse-only expansion — for user-added exercises, coach notes, warm-ups. */
const BROWSABLE_EXERCISES: Exercise[] = [...exerciseLibrary, ...exerciseExpansion];

export function findBrowsableExercise(name: string, label?: string): Exercise | undefined {
  const normalized = name.toLowerCase().trim();
  const labelNorm = label?.toLowerCase().trim();

  for (const source of [exerciseLibrary, exerciseExpansion]) {
    const exact = source.find((ex) => {
      if (ex.name.toLowerCase() !== normalized) return false;
      if (labelNorm) return ex.label.toLowerCase() === labelNorm;
      return true;
    });
    if (exact) return exact;
  }

  for (const source of [exerciseLibrary, exerciseExpansion]) {
    const fuzzy = source.find((ex) => {
      const exName = ex.name.toLowerCase();
      if (exName === normalized) return true;
      if (labelNorm && exName.includes(labelNorm) && exName.includes(normalized.split(" ")[0] ?? "")) {
        return true;
      }
      return exName.includes(normalized) || normalized.includes(exName);
    });
    if (fuzzy) return fuzzy;
  }

  return undefined;
}

export { BROWSABLE_EXERCISES };
