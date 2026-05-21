import { PLAN_START_ISO, SPLIT, planWeekIndex } from "./data";
import {
  JIMMY_DAILY_SCHEDULE,
  JIMMY_WEEKLY_SCHEDULE,
  isJimmySummerPlanTemplates,
  jimmySuggestedRoutineIdForDate,
} from "./jimmyWeekly";
import type { DailyTask, MacroTotals, WorkoutRoutineTemplate } from "./types";

export const DAILY_STORAGE_KEY = "fitcoach:daily:v5";

type PersistedDaily = { dateKey: string; tasks: DailyTask[]; targetsSig?: string };

function nutritionTargetsSig(t: MacroTotals): string {
  return `${t.cal}-${t.p}-${t.c}-${t.f}`;
}

function workoutTemplatesSig(templates: WorkoutRoutineTemplate[] | undefined): string {
  return templates && isJimmySummerPlanTemplates(templates) ? "jimmy" : "def";
}

function dailyPlanSig(
  t: MacroTotals,
  planStartIso: string,
  stepsTarget: number,
  templates: WorkoutRoutineTemplate[] | undefined,
): string {
  return `${nutritionTargetsSig(t)}|${planStartIso}|${stepsTarget}|${workoutTemplatesSig(templates)}`;
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Short heading for home eyebrow, e.g. THU MAY 21 */
export function formatDateKeyEyebrow(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "").toUpperCase();
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
    `Weekly scale rule: log morning weight on Progress (post-bathroom, fasted); Sunday review compares week averages.`,
    `Planned treat beats random binge: one controlled dessert still works if totals stay honest in Fuel.`,
  ];
}

export function generateDailyTasksForDate(
  d: Date,
  targets: MacroTotals,
  planStartIso: string = PLAN_START_ISO,
  stepsTarget: number = 10_000,
  workoutTemplates?: WorkoutRoutineTemplate[],
): DailyTask[] {
  const dateKey = localDateKey(d);
  const seed = hashSeed(dateKey);
  const dow = d.getDay();
  const wk = planWeekIndex(d, planStartIso);
  const steps = stepsTarget;
  const jimmy = Boolean(workoutTemplates && isJimmySummerPlanTemplates(workoutTemplates));

  const tasks: DailyTask[] = [];

  if (dow === 6) {
    if (jimmy) {
      tasks.push({
        id: `${dateKey}_g0`,
        category: "gym",
        title: `Saturday · ${JIMMY_WEEKLY_SCHEDULE.saturday.note ?? "Active recovery"}`,
        done: false,
      });
    } else {
      tasks.push({
        id: `${dateKey}_g0`,
        category: "gym",
        title: "Saturday · Active recovery: 45–60 min easy walk, light mobility, optional easy bike — not a hard workout.",
        done: false,
      });
    }
    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: `Light movement day — aim ${steps.toLocaleString()} steps when you can.`,
      done: false,
    });
  } else if (dow === 0) {
    if (jimmy) {
      tasks.push({
        id: `${dateKey}_g0`,
        category: "gym",
        title: `Sunday · ${JIMMY_WEEKLY_SCHEDULE.sunday.note ?? "Rest and meal prep."}`,
        done: false,
      });
    } else {
      tasks.push({
        id: `${dateKey}_g0`,
        category: "gym",
        title: "Sunday · Rest. No lifting mindset — optional easy stretch or breathwork only.",
        done: false,
      });
    }
    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: `Still move if you can: easy steps toward ${steps.toLocaleString()} without a structured workout.`,
      done: false,
    });
  } else if (jimmy && workoutTemplates) {
    const rid = jimmySuggestedRoutineIdForDate(d);
    const tpl = rid ? workoutTemplates.find((t) => t.id === rid) : undefined;
    const dayLab = tpl?.dayLabel?.trim() || "Weekday";
    const name = tpl?.name?.trim() || "Training";
    const focus = tpl?.focus?.trim() || "";
    const warm = tpl?.warmupTip?.trim() || "Warm up before your first heavy set.";
    tasks.push({
      id: `${dateKey}_g0`,
      category: "gym",
      title: `${dayLab} · ${name}${focus ? ` (${focus})` : ""} — ${warm} Tap your matching routine in Workout.`,
      done: false,
      navigateTo: "workout",
    });
    tasks.push({
      id: `${dateKey}_g1`,
      category: "gym",
      title: "Mountainside rhythm: log every set · two-more-reps rule · 60–90s rest between working sets.",
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
  const nutExtra =
    jimmy && dow >= 1 && dow <= 5
      ? `Jimmy fuel rhythm: ${JIMMY_DAILY_SCHEDULE.map((s) => `${s.time} ${s.label}`).join(" → ")}. Quick-add from Saved presets.`
      : extras[pickDistinctIndices(seed + 7, 1, extras.length)[0]!]!;
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
        "Sunday check-in: week-over-week weight trend, progress photos (same mirror/light: front/side/back, relaxed + flexed), days you hit calories + protein + steps, workouts completed, biggest struggle.",
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
  workoutTemplates?: WorkoutRoutineTemplate[],
): DailyTask[] {
  const now = new Date();
  const key = localDateKey(now);
  const sig = dailyPlanSig(targets, planStartIso, stepsTarget, workoutTemplates);
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
  const tasks = generateDailyTasksForDate(now, targets, planStartIso, stepsTarget, workoutTemplates);
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
  workoutTemplates?: WorkoutRoutineTemplate[],
): void {
  const key = localDateKey(new Date());
  try {
    localStorage.setItem(
      DAILY_STORAGE_KEY,
      JSON.stringify({
        dateKey: key,
        targetsSig: dailyPlanSig(targets, planStartIso, stepsTarget, workoutTemplates),
        tasks,
      }),
    );
  } catch {
    /* ignore */
  }
}
