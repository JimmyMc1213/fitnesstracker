import { PLAN_START_ISO, SPLIT, planWeekIndex } from "./data";
import type { DailyTask, MacroTotals } from "./types";

export const DAILY_STORAGE_KEY = "fitcoach:daily:v5";

type PersistedDaily = { dateKey: string; tasks: DailyTask[]; targetsSig?: string };

function nutritionTargetsSig(t: MacroTotals): string {
  return `${t.cal}-${t.p}-${t.c}-${t.f}`;
}

function dailyPlanSig(t: MacroTotals, planStartIso: string, stepsTarget: number): string {
  return `${nutritionTargetsSig(t)}|${planStartIso}|${stepsTarget}`;
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Calendar date in America/Phoenix (no DST). */
export function arizonaCalendarDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** True from 8:00 PM onward, Arizona local time. */
export function isArizonaEightPmOrLater(d: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    hour: "numeric",
    hour12: false,
  }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value;
  const hour = h != null ? parseInt(h, 10) : 0;
  return hour >= 20;
}

/** Short label for UI, e.g. "Wed · May 6" */
export function formatDailyPlanSubtitle(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function hashSeed(dateKey: string): number {
  let h = 5381;
  for (let i = 0; i < dateKey.length; i++) {
    h = ((h << 5) + h) ^ dateKey.charCodeAt(i);
  }
  return Math.abs(h);
}

function pickDistinctIndices(seed: number, count: number, len: number): number[] {
  if (len <= 0) return [];
  const scored = Array.from({ length: len }, (_, i) => ({
    i,
    s: (seed + i * 2654435761) >>> 0,
  }));
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, Math.min(count, len)).map((x) => x.i);
}

type SplitEntry = (typeof SPLIT)[number];

function splitForWeekday(d: Date): SplitEntry | null {
  const map: Record<number, SplitEntry | undefined> = {
    1: SPLIT[0],
    2: SPLIT[1],
    3: SPLIT[2],
    4: SPLIT[3],
    5: SPLIT[4],
  };
  return map[d.getDay()] ?? null;
}

const LIFE_LINES = [
  "Night-before gym: clothes, bottle, headphones, know tomorrow's session + warm-up — decision fatigue is the enemy at 5 a.m.",
  "Hard stop screens 45 minutes before bed — book, breathwork, or light stretch instead.",
  "No binge triggers at home: sweets only outside the house; build the environment, not more willpower.",
  "After a binge: next day is normal calories, normal protein, normal training — no starvation payback.",
  "Two outdoor walks if possible — treat the second as recovery, not a podcast multitask.",
  "Extra easy walk (10–20 min): stack steps without turning it into a second workout.",
] as const;

function nutritionExtraLines(targets: MacroTotals): string[] {
  return [
    `Protein anchor: ${targets.p}g every day — partial days still need this floor.`,
    `Structure, not perfection: most meals = protein + carb + produce; you pick the foods inside ~${targets.cal} kcal.`,
    `Fat around ${targets.f}g — don't zero-fat while cutting and training 5×/week.`,
    `Sweet rule: water/diet drink → 30g protein → wait 10 minutes — then one measured serving if you still want it.`,
    `Weekly scale rule: adjust from the 7-day average weigh-in only (morning, post-bathroom, fasted).`,
    `Planned treat beats random binge: one controlled dessert still works if totals stay honest in Fuel.`,
  ];
}

export function generateDailyTasksForDate(
  d: Date,
  targets: MacroTotals,
  planStartIso: string = PLAN_START_ISO,
  stepsTarget: number = 10_000,
): DailyTask[] {
  const dateKey = localDateKey(d);
  const seed = hashSeed(dateKey);
  const dow = d.getDay();
  const wk = planWeekIndex(d, planStartIso);
  const steps = stepsTarget;

  const tasks: DailyTask[] = [];

  if (dow === 6) {
    tasks.push({
      id: `${dateKey}_g0`,
      category: "gym",
      title: "Saturday · Active recovery: 45–60 min easy walk, light mobility, optional easy bike — not a hard workout.",
      done: false,
    });
    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: `Light movement day — aim ${steps.toLocaleString()} steps when you can.`,
      done: false,
    });
  } else if (dow === 0) {
    tasks.push({
      id: `${dateKey}_g0`,
      category: "gym",
      title: "Sunday · Rest. No lifting mindset — optional easy stretch or breathwork only.",
      done: false,
    });
    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: `Still move if you can: easy steps toward ${steps.toLocaleString()} without a structured workout.`,
      done: false,
    });
  } else {
    const split = splitForWeekday(d)!;
    const cardioToday = dow === 1 || dow === 3 || dow === 5;

    tasks.push({
      id: `${dateKey}_g0`,
      category: "gym",
      title: `${split.day} · ${split.name} — warm-up 8–10 min (easy cardio + mobility + band pull-aparts) then ramp sets before first heavy lift. ${split.focus}.`,
      done: false,
      navigateTo: "workout",
    });

    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: cardioToday
        ? "Post-lift cardio: 20 min incline walk, 8–12% grade, ~2.8–3.5 mph — easy nose breathing."
        : "Progression: keep weight until you hit the top of the rep range on every working set — then add ~5 lb.",
      done: false,
      navigateTo: "workout",
    });

    tasks.push({
      id: `${dateKey}_g2`,
      category: "gym",
      title: "Effort: leave 1–2 reps in the tank on most sets — don't max out every session.",
      done: false,
      navigateTo: "workout",
    });
  }

  tasks.push({
    id: `${dateKey}_n0`,
    category: "nutrition",
    title: `Hit ${targets.p}g protein · ~${targets.f}g fat · fill carbs toward ~${targets.cal} kcal — log honestly in Fuel (program week ${wk}/12, started ${planStartIso}).`,
    done: false,
    navigateTo: "nutrition",
  });

  const extras = nutritionExtraLines(targets);
  const nutExtra = extras[pickDistinctIndices(seed + 7, 1, extras.length)[0]!]!;
  tasks.push({
    id: `${dateKey}_n1`,
    category: "nutrition",
    title: nutExtra,
    done: false,
    navigateTo: "nutrition",
  });

  if (dow === 0) {
    tasks.push({
      id: `${dateKey}_l0`,
      category: "life",
      title:
        "Sunday check-in: 7-day average weight, progress photos (same mirror/light: front/side/back, relaxed + flexed), days you hit calories + protein + steps, workouts completed, biggest struggle.",
      done: false,
    });
    tasks.push({
      id: `${dateKey}_l1`,
      category: "life",
      title:
        "Sunday: weekly fuel review from Mon–Sun averages (7 weigh-in days this week & last). Approve or edit the kcal change — nothing updates until you do. Recovery flag adds +100 kcal to the recommendation.",
      done: false,
      navigateTo: "progress",
    });
  } else {
    const lifeIdx = pickDistinctIndices(seed + 19, 1, LIFE_LINES.length);
    tasks.push({
      id: `${dateKey}_l0`,
      category: "life",
      title: LIFE_LINES[lifeIdx[0]!],
      done: false,
    });
    tasks.push({
      id: `${dateKey}_l1`,
      category: "life",
      title:
        "Low-back fix ~8 min (4–6×/week): child's pose breathing, couch stretch, hamstrings, figure-4 glutes, dead bugs, side planks — no aggressive low-back stretching.",
      done: false,
    });
  }

  return tasks;
}

export function loadTasksForToday(
  targets: MacroTotals,
  planStartIso: string = PLAN_START_ISO,
  stepsTarget: number = 10_000,
): DailyTask[] {
  const now = new Date();
  const key = localDateKey(now);
  const sig = dailyPlanSig(targets, planStartIso, stepsTarget);
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedDaily;
      if (
        parsed.dateKey === key &&
        Array.isArray(parsed.tasks) &&
        parsed.tasks.length > 0 &&
        parsed.targetsSig === sig
      ) {
        return parsed.tasks;
      }
    }
  } catch {
    /* ignore */
  }
  const tasks = generateDailyTasksForDate(now, targets, planStartIso, stepsTarget);
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ dateKey: key, targetsSig: sig, tasks }));
  } catch {
    /* ignore */
  }
  return tasks;
}

export function persistTasksForToday(
  tasks: DailyTask[],
  targets: MacroTotals,
  planStartIso: string = PLAN_START_ISO,
  stepsTarget: number = 10_000,
): void {
  const key = localDateKey(new Date());
  try {
    localStorage.setItem(
      DAILY_STORAGE_KEY,
      JSON.stringify({ dateKey: key, targetsSig: dailyPlanSig(targets, planStartIso, stepsTarget), tasks }),
    );
  } catch {
    /* ignore */
  }
}
