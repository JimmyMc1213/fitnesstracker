/** Shared Jimmy plan schedule — safe to import from `dailyPlan` (no cycle with seed → buildAppState). */

export const JIMMY_WEEKLY_SCHEDULE = {
  monday: { routineId: "mon-chest-triceps", rest: false },
  tuesday: { routineId: "tue-back-biceps", rest: false },
  wednesday: { routineId: "wed-legs", rest: false },
  thursday: { routineId: "thu-full-upper", rest: false },
  friday: { routineId: "fri-arms-abs", rest: false },
  saturday: { routineId: null, rest: true, note: "10,000 steps — walk" },
  sunday: {
    routineId: null,
    rest: true,
    note: "Meal prep day — 90 min. 4 lunch containers + grocery run.",
  },
} as const;

const DOW_TO_SCHEDULE_KEY = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export type JimmyScheduleKey = (typeof DOW_TO_SCHEDULE_KEY)[number];

/** Maps local weekday → saved routine id (null on rest days). */
export function jimmySuggestedRoutineIdForDate(d: Date): string | null {
  const key = DOW_TO_SCHEDULE_KEY[d.getDay()];
  const row = JIMMY_WEEKLY_SCHEDULE[key];
  if (!row || row.rest || !row.routineId) return null;
  return row.routineId;
}

export function isJimmySummerPlanTemplates(templates: { id: string }[]): boolean {
  return templates.some((t) => t.id === "mon-chest-triceps");
}

export const JIMMY_DAILY_SCHEDULE = [
  {
    time: "4:30am",
    label: "Pre-workout",
    presetId: "pre-workout-banana",
    note: "Eat before you leave for Mountainside",
  },
  {
    time: "5:00am",
    label: "Gym — Mountainside Fitness",
    presetId: null,
    note: "Warmup first. Log every set. 2 more reps rule.",
  },
  {
    time: "6:00-6:30am",
    label: "Post-workout shake",
    presetId: "post-workout-shake",
    note: "Drink within 30 min of finishing. Rush? Grab a Fairlife.",
  },
  {
    time: "12:00-1:00pm",
    label: "Desk lunch",
    presetId: "meal-prep-lunch",
    note: "Meal prep container from Sunday. Log it.",
  },
  {
    time: "3:30-4:00pm",
    label: "Afternoon snack",
    presetId: "afternoon-snack",
    note: "Turkey + Oikos. Zero effort.",
  },
  {
    time: "6:30-7:30pm",
    label: "Dinner",
    presetId: "dinner-chicken",
    note: "Chicken or T-bone. 200g cooked protein, 150g sweet potato, 150g veg.",
  },
] as const;
