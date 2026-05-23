import type { CoachContext } from "./coachEngine";

export type MacroPaceStatus = "hit" | "on_pace" | "behind" | "ahead";

export type MacroPaceSnapshot = {
  status: MacroPaceStatus;
  /** Expected protein grams by current time-of-day fraction. */
  expectedProtein: number;
  /** Grams behind expected pace (positive = behind). */
  proteinPaceDelta: number;
  hint: string;
};

const MIN_DAY_FRACTION = 0.12;
const ON_PACE_GRAMS = 8;

/** Time-weighted protein pace for coach copy — pure, no side effects. */
export function buildMacroPaceSnapshot(ctx: CoachContext): MacroPaceSnapshot {
  const targetP = ctx.state.nutritionTargets.p;
  const actualP = ctx.nutritionTotals.p;

  if (targetP <= 0) {
    return {
      status: "on_pace",
      expectedProtein: 0,
      proteinPaceDelta: 0,
      hint: "Log fuel to keep today's plan honest.",
    };
  }

  if (actualP >= targetP || ctx.nutritionGoalHit) {
    return {
      status: "hit",
      expectedProtein: targetP,
      proteinPaceDelta: 0,
      hint: "Protein floor hit — on pace for today.",
    };
  }

  const hour = ctx.now.getHours() + ctx.now.getMinutes() / 60;
  const dayFraction = Math.min(1, Math.max(MIN_DAY_FRACTION, hour / 24));
  const expectedProtein = targetP * dayFraction;
  const proteinPaceDelta = expectedProtein - actualP;

  if (proteinPaceDelta <= ON_PACE_GRAMS) {
    return {
      status: "on_pace",
      expectedProtein,
      proteinPaceDelta,
      hint: "On pace for today's protein floor.",
    };
  }

  if (proteinPaceDelta > ON_PACE_GRAMS) {
    return {
      status: "behind",
      expectedProtein,
      proteinPaceDelta,
      hint: `${Math.round(proteinPaceDelta)}g behind pace — log fuel to stay on track.`,
    };
  }

  return {
    status: "ahead",
    expectedProtein,
    proteinPaceDelta,
    hint: `${Math.round(Math.abs(proteinPaceDelta))}g ahead of pace — keep the floor locked.`,
  };
}
