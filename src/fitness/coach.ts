import type { WorkoutState } from "./types";

import { JIMMY_INTENSITY_RULES } from "./jimmy-seed-data";

function jimmyRuleIndex(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
  }
  return Math.abs(h) % Math.max(1, JIMMY_INTENSITY_RULES.length);
}

/** Rotating motivational line from the summer plan intensity rules. */
export function jimmyIntensityCoachingLine(dayKey: string): string {
  const r = JIMMY_INTENSITY_RULES[jimmyRuleIndex(`${dayKey}|jimmy`)]!;
  return `${r.title} — ${r.description}`;
}

export function progressiveOverloadInsight(w: WorkoutState): string {
  const primary = w.exercises[0];
  if (!primary) {
    return "Log every working set. You add weight only after you own the top of the rep range on every set — boring consistency beats chaos.";
  }

  const incomplete = primary.sets.find((s) => !s.done);
  if (incomplete) {
    if (incomplete.w > 0 && incomplete.r > 0) {
      return `Finish logging ${primary.name} at ${incomplete.w} lb × ${incomplete.r}. Clear reps build your progression signal for next week.`;
    }
    if (incomplete.w > 0 && incomplete.r === 0) {
      return `Add reps for your next ${primary.name} set at ${incomplete.w} lb — the plan advances when the full set range is clean, not when one set guesses.`;
    }
    return `Lead with ${primary.name}. Hit the listed rep range with 1–2 reps left in the tank; chase clean reps before heavier loads.`;
  }

  const doneSets = primary.sets.filter((s) => s.done && s.r > 0 && s.w > 0);
  if (doneSets.length === 0) {
    return `Track weight × reps for ${primary.name}. Same weight until the top of the range hits on every working set — then move up ~5 lb.`;
  }

  const top = Math.max(...doneSets.map((s) => s.w));
  const maxR = Math.max(...doneSets.map((s) => s.r));
  return `Solid work on ${primary.name} (${top} lb, up to ${maxR} reps logged). If you hit the top of the range on every set with reps in reserve, add ~5 lb next week — otherwise repeat and clean it up.`;
}
