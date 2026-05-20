// ============================================================
// JIMMY'S COMPLETE SUMMER PLAN — APP SEED DATA
// ============================================================

import { buildAppStateFromPersisted } from "./buildAppState";
import { jimmySuggestedRoutineIdForDate } from "./jimmyWeekly";
import { loadPersistedSlice, savePersistedSlice, sliceFromAppState } from "./persistFitnessSlice";
import type {
  HabitTemplate,
  MacroTotals,
  NutritionPreset,
  ProgressGoalConfig,
  WorkoutRoutineTemplate,
  AppState,
} from "./types";

export { isJimmySummerPlanTemplates, jimmySuggestedRoutineIdForDate, JIMMY_DAILY_SCHEDULE, JIMMY_WEEKLY_SCHEDULE } from "./jimmyWeekly";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;       // e.g. "6-8" or "failure" or "15 ea"
  notes?: string;
}

export interface WarmupItem {
  description: string;
}

export interface Routine {
  id: string;
  name: string;
  dayLabel: string;   // e.g. "Monday"
  tag: string;        // e.g. "Push"
  warmupMinutes: number;
  warmup: WarmupItem[];
  warmupTip: string;
  exercises: Exercise[];
  tip: string;
}

// ─── 1. MACRO TARGETS ────────────────────────────────────────
export const JIMMY_NUTRITION_TARGETS: MacroTotals = {
  cal: 2000,
  p: 175,
  c: 160,
  f: 55,
};

/** @deprecated Use JIMMY_NUTRITION_TARGETS */
export const JIMMY_MACRO_TARGETS = JIMMY_NUTRITION_TARGETS;

// ─── 2. SETTINGS (reference) ─────────────────────────────────
export const JIMMY_SETTINGS = {
  displayName: "Jimmy",
  nutritionTargets: JIMMY_NUTRITION_TARGETS,
  dailyStepsGoal: 10000,
  planStartIso: new Date().toISOString().split("T")[0],
  goalWeightLow: 160,
  goalWeightHigh: 165,
  currentWeight: 175,
};

// ─── 3. NUTRITION PRESETS (raw; use jimmyNutritionPresetsForApp()) ──
type PresetRaw = Omit<NutritionPreset, "lastUsedAtMs">;

export const JIMMY_NUTRITION_PRESETS_RAW: PresetRaw[] = [
  // ── Pre-workout ──
  {
    id: "pre-workout-banana",
    name: "Pre-Workout Banana",
    cal: 107,
    p: 1,
    c: 27,
    f: 0,
    notes: "120g peeled banana — eat at 4:30am before gym",
  },

  // ── Post-workout shake ──
  {
    id: "post-workout-shake",
    name: "Post-Workout Shake",
    cal: 400,
    p: 42,
    c: 45,
    f: 7,
    notes:
      "2 scoops Santa Cruz Paleo Vanilla (54g) + 150g almond milk + 120g banana + 80g frozen strawberries + ice",
  },

  // ── Shake components (for when you want to log individually) ──
  {
    id: "santa-cruz-protein-2-scoops",
    name: "Santa Cruz Paleo Protein — 2 scoops",
    cal: 220,
    p: 40,
    c: 4,
    f: 4,
    notes: "54g — vanilla grass-fed whey",
  },
  {
    id: "almond-milk-150g",
    name: "Almond Milk",
    cal: 22,
    p: 1,
    c: 1,
    f: 2,
    notes: "150g",
  },
  {
    id: "banana-120g",
    name: "Banana (peeled)",
    cal: 107,
    p: 1,
    c: 27,
    f: 0,
    notes: "120g — always weigh peeled",
  },
  {
    id: "frozen-strawberries-80g",
    name: "Frozen Strawberries",
    cal: 26,
    p: 1,
    c: 6,
    f: 0,
    notes: "80g",
  },

  // ── Fairlife (rush option) ──
  {
    id: "fairlife-chocolate",
    name: "Fairlife Chocolate Milk",
    cal: 340,
    p: 52,
    c: 29,
    f: 5,
    notes: "Rush substitute for post-workout shake — grab and go",
  },

  // ── Lunch (meal prep container) ──
  {
    id: "meal-prep-lunch",
    name: "Meal Prep Lunch Container",
    cal: 550,
    p: 55,
    c: 45,
    f: 18,
    notes:
      "200g cooked 93/7 ground beef + 200g cooked sweet potato + 100g spinach or broccoli",
  },

  // ── Lunch components ──
  {
    id: "ground-beef-93-7-200g",
    name: "93/7 Ground Beef (cooked)",
    cal: 310,
    p: 44,
    c: 0,
    f: 14,
    notes: "200g cooked weight — Sprouts brand. Always weigh cooked not raw.",
  },
  {
    id: "sweet-potato-200g",
    name: "Sweet Potato (cooked)",
    cal: 172,
    p: 3,
    c: 40,
    f: 0,
    notes: "200g cooked, cubed",
  },
  {
    id: "sweet-potato-150g",
    name: "Sweet Potato (cooked, dinner portion)",
    cal: 129,
    p: 2,
    c: 30,
    f: 0,
    notes: "150g cooked — dinner side",
  },
  {
    id: "spinach-100g",
    name: "Spinach",
    cal: 23,
    p: 3,
    c: 4,
    f: 0,
    notes: "100g — lunch veggie",
  },
  {
    id: "broccoli-100g",
    name: "Broccoli",
    cal: 34,
    p: 3,
    c: 7,
    f: 0,
    notes: "100g — lunch or dinner veggie",
  },
  {
    id: "broccoli-150g",
    name: "Broccoli (dinner portion)",
    cal: 51,
    p: 4,
    c: 10,
    f: 1,
    notes: "150g — dinner side",
  },
  {
    id: "green-beans-150g",
    name: "Green Beans",
    cal: 53,
    p: 3,
    c: 12,
    f: 0,
    notes: "150g — dinner veggie swap",
  },

  // ── Afternoon snack ──
  {
    id: "afternoon-snack",
    name: "Afternoon Snack",
    cal: 340,
    p: 45,
    c: 12,
    f: 5,
    notes: "150g lean deli turkey slices + 1 Oikos Greek yogurt cup",
  },
  {
    id: "deli-turkey-150g",
    name: "Lean Deli Turkey Slices",
    cal: 187,
    p: 36,
    c: 2,
    f: 3,
    notes: "150g — Sprouts. Zero cooking, grab and go.",
  },
  {
    id: "oikos-yogurt",
    name: "Oikos Greek Yogurt Cup",
    cal: 140,
    p: 20,
    c: 10,
    f: 2,
    notes: "1 cup — 140 cal / 20g protein",
  },

  // ── Dinner proteins ──
  {
    id: "chicken-breast-200g",
    name: "Chicken Breast (cooked)",
    cal: 330,
    p: 62,
    c: 0,
    f: 7,
    notes: "200g cooked weight",
  },
  {
    id: "tbone-steak-200g",
    name: "T-Bone Steak (cooked)",
    cal: 430,
    p: 48,
    c: 0,
    f: 26,
    notes:
      "200g cooked weight — higher fat, go easy on extra sides on T-bone nights",
  },

  // ── Full dinner combos ──
  {
    id: "dinner-chicken",
    name: "Dinner — Chicken",
    cal: 510,
    p: 67,
    c: 40,
    f: 8,
    notes: "200g chicken + 150g sweet potato + 150g broccoli",
  },
  {
    id: "dinner-tbone",
    name: "Dinner — T-Bone Night",
    cal: 609,
    p: 53,
    c: 30,
    f: 27,
    notes:
      "200g T-bone + 150g sweet potato + 150g green beans. Skip extra sides.",
  },

  // ── Eating out ──
  {
    id: "canes-3-piece",
    name: "Cane's — 3 Piece, No Sauce",
    cal: 800,
    p: 45,
    c: 60,
    f: 35,
    notes: "Emergency option — water to drink, no sauce",
  },
];

// ─── 4. WORKOUT ROUTINES ─────────────────────────────────────
export const JIMMY_ROUTINES: Routine[] = [
  // ── MONDAY: Chest + Triceps ──
  {
    id: "mon-chest-triceps",
    name: "Chest + Triceps",
    dayLabel: "Monday",
    tag: "Push",
    warmupMinutes: 8,
    warmup: [
      { description: "Arm circles — 30 sec forward, 30 sec back" },
      { description: "Band pull-aparts or light face pull — 2×15" },
      { description: "Incline machine press — 1×15 at 40% working weight" },
      { description: "Incline machine press — 1×8 at 70% working weight" },
      { description: "30 sec chest stretch at cable station" },
    ],
    warmupTip:
      "Never skip the two warmup sets on incline. Cold pressing = shoulder problems.",
    exercises: [
      {
        name: "Incline Machine Press",
        sets: 4,
        reps: "6-8",
        notes: "Primary chest compound — go heavy, controlled descent",
      },
      {
        name: "Cable Fly (low to high)",
        sets: 3,
        reps: "12",
        notes: "Full stretch at bottom, squeeze at top",
      },
      {
        name: "Pec Deck",
        sets: 3,
        reps: "12-15",
        notes: "Constant tension, don't let weight stack touch between reps",
      },
      {
        name: "Overhead Tricep Extension",
        sets: 3,
        reps: "12",
        notes: "Long head focus — get full stretch overhead",
      },
      {
        name: "Single Arm Pushdown",
        sets: 3,
        reps: "12 ea",
        notes: "Each arm individually — full extension at bottom",
      },
      {
        name: "JM Press",
        sets: 3,
        reps: "10",
        notes:
          "EZ bar, lower toward chin, elbows angled in tracking toward collarbone. Start light — form first.",
      },
    ],
    tip: "JM press is a hybrid skull crusher + close grip press. Hits the long head hard. Don't ego load this — technique matters.",
  },

  // ── TUESDAY: Back + Biceps ──
  {
    id: "tue-back-biceps",
    name: "Back + Biceps",
    dayLabel: "Tuesday",
    tag: "Pull",
    warmupMinutes: 8,
    warmup: [
      { description: "Dead hangs — 2×20 sec (decompress spine, open lats)" },
      { description: "Lat pulldown — 1×15 light, full stretch at top" },
      { description: "T-bar row — 1×12 at 50% working weight" },
      { description: "Face pull — 1×15 light (shoulder health)" },
    ],
    warmupTip:
      "Feel the lats stretch on every warmup rep. If you can't feel them warming up, you won't feel them during working sets.",
    exercises: [
      {
        name: "T-Bar Row",
        sets: 4,
        reps: "6-8",
        notes: "Chest on pad, drive elbows back, squeeze at top",
      },
      {
        name: "Lat Pulldown",
        sets: 4,
        reps: "8-10",
        notes: "Full stretch at top, pull to upper chest — feel the lats",
      },
      {
        name: "Close Grip Cable Row",
        sets: 3,
        reps: "10",
        notes: "Elbows tight to body, full contraction at end of row",
      },
      {
        name: "Pull-Ups (bodyweight)",
        sets: 2,
        reps: "failure",
        notes: "Do every rep you have. This builds the V-taper more than anything.",
      },
      {
        name: "Preacher Curl",
        sets: 3,
        reps: "10",
        notes: "Isolates the peak — slow on the way down",
      },
      {
        name: "Hammer Curl",
        sets: 3,
        reps: "12",
        notes: "Hits brachialis — arm thickness",
      },
      {
        name: "Standing Cable Curl",
        sets: 3,
        reps: "12",
        notes: "Constant tension — don't let tension drop at bottom",
      },
    ],
    tip: "Three bicep movements serve three purposes: preacher = peak, hammer = thickness, cable = constant tension. Don't skip any.",
  },

  // ── WEDNESDAY: Legs ──
  {
    id: "wed-legs",
    name: "Legs",
    dayLabel: "Wednesday",
    tag: "Legs",
    warmupMinutes: 10,
    warmup: [
      { description: "Hip circles — 10 each direction" },
      { description: "Bodyweight squat — 2×15 slow and controlled" },
      { description: "Hip flexor stretch — 30 sec each side" },
      { description: "Hack squat — 1×15 at 40% working weight" },
      { description: "Hack squat — 1×8 at 70% working weight" },
      { description: "Leg curl — 1×15 light (wake up hamstrings)" },
    ],
    warmupTip:
      "Legs need the longest warmup. Rushing into hack squat cold = knee pain. Do this every single time.",
    exercises: [
      {
        name: "Hack Squat",
        sets: 4,
        reps: "8-10",
        notes:
          "Feet slightly high and wide on platform. Takes spinal load out completely.",
      },
      {
        name: "Romanian Deadlift",
        sets: 3,
        reps: "10",
        notes:
          "Push hips back, soft knees, bar close to legs, stop just below knee. 3 sec descent. Never round lower back.",
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: "12",
        notes: "Full range — don't lock out at top",
      },
      {
        name: "Seated Leg Curl",
        sets: 3,
        reps: "12",
        notes: "Full extension at top, squeeze at bottom",
      },
      {
        name: "Leg Extension",
        sets: 3,
        reps: "15",
        notes: "Quad isolation — pause and squeeze at top of each rep",
      },
      {
        name: "Standing Calf Raise",
        sets: 4,
        reps: "15",
        notes: "Full stretch at bottom, full squeeze at top — don't bounce",
      },
    ],
    tip: "RDL is your most technical movement today. If your lower back rounds, the weight is too heavy. Drop it and prioritize form.",
  },

  // ── THURSDAY: Chest + Back + Shoulders ──
  {
    id: "thu-full-upper",
    name: "Chest + Back + Shoulders",
    dayLabel: "Thursday",
    tag: "Full Upper",
    warmupMinutes: 10,
    warmup: [
      { description: "Arm circles — 30 sec each direction" },
      { description: "Band pull-aparts — 2×15" },
      { description: "Dead hang — 2×20 sec" },
      { description: "OHP — 1×15 at 40% working weight" },
      { description: "T-bar row — 1×12 at 50% working weight" },
      {
        description: "Incline machine press — 1×15 at 40% working weight",
      },
    ],
    warmupTip:
      "Three warmup sets because you're hitting three muscle groups. High volume day — don't rush the warmup.",
    exercises: [
      {
        name: "OHP (barbell or machine)",
        sets: 4,
        reps: "6-8",
        notes: "Goes first while you're fully fresh. Control the descent.",
      },
      {
        name: "T-Bar Row",
        sets: 4,
        reps: "6-8",
        notes: "Chest rests while back works — alternate push/pull intentionally",
      },
      {
        name: "Incline Machine Press",
        sets: 4,
        reps: "8-10",
        notes: "Second chest stimulus of the week — slightly higher rep range",
      },
      {
        name: "Lat Pulldown",
        sets: 3,
        reps: "10",
        notes: "Back rests during incline — now pull again",
      },
      {
        name: "Pec Deck",
        sets: 3,
        reps: "12-15",
        notes: "Isolation finisher for chest — constant tension",
      },
      {
        name: "Lateral Raises",
        sets: 4,
        reps: "15",
        notes: "No momentum — strict, controlled, feel the burn",
      },
      {
        name: "Rear Delt Fly",
        sets: 3,
        reps: "15",
        notes: "Isolate the rear delt — squeeze at the top",
      },
    ],
    tip: "Push and pull alternate so nothing burns out early. Isolations come last. Expect 60–70 min — your biggest day of the week.",
  },

  // ── FRIDAY: Arms + Abs ──
  {
    id: "fri-arms-abs",
    name: "Arms + Abs",
    dayLabel: "Friday",
    tag: "Arms",
    warmupMinutes: 6,
    warmup: [
      { description: "Wrist circles — 30 sec each direction" },
      { description: "Light preacher curl — 1×15 at 30% working weight" },
      { description: "Tricep pushdown — 1×20 very light (elbow warmup)" },
      { description: "30 sec overhead tricep stretch each arm" },
    ],
    warmupTip:
      "Arms are already pre-warmed from Mon and Tue. Keep this short and get into it.",
    exercises: [
      {
        name: "Preacher Curl",
        sets: 4,
        reps: "10",
        notes: "Swap for incline curl for variety",
      },
      {
        name: "Hammer Curl",
        sets: 3,
        reps: "12",
        notes: "Swap for cross-body hammer for variety",
      },
      {
        name: "Standing Cable Curl",
        sets: 3,
        reps: "12",
        notes: "Swap for spider curl for variety",
      },
      {
        name: "JM Press",
        sets: 4,
        reps: "10",
        notes: "EZ bar — same form as Monday. Heavier than Mon warmup.",
      },
      {
        name: "Single Arm Pushdown",
        sets: 3,
        reps: "12 ea",
        notes: "Full extension, controlled return",
      },
      {
        name: "Cable Ab Crunch",
        sets: 4,
        reps: "15",
        notes: "Rope attachment, kneel, crunch elbows to knees",
      },
    ],
    tip: "Friday is a fun day — swap exercises freely within the same movement pattern. Keeps it enjoyable and your muscles guessing.",
  },
];

// ─── 5. HABIT TEMPLATES ──────────────────────────────────────
export const JIMMY_HABITS: HabitTemplate[] = [
  {
    id: "habit-water",
    name: "Drink 1 gallon of water",
    icon: "drop",
    subtitle: "Hydration drives performance and fat loss",
  },
  {
    id: "habit-track",
    name: "Track every meal",
    icon: "bolt",
    subtitle: "Log even the bad days — especially the bad days",
  },
  {
    id: "habit-protein",
    name: "Hit 175g protein",
    icon: "bolt",
    subtitle: "Protein first, always",
  },
  {
    id: "habit-steps",
    name: "10,000 steps",
    icon: "run",
    subtitle: "Weekends especially — burns fat without touching recovery",
  },
  {
    id: "habit-creatine",
    name: "Take creatine (3-5g)",
    icon: "bolt",
    subtitle: "Every day — including rest days",
  },
  {
    id: "habit-sleep",
    name: "Sleep 7-8 hours",
    icon: "moon",
    subtitle: "You build muscle while you sleep, not while you lift",
  },
  {
    id: "habit-weigh",
    name: "Morning weigh-in",
    icon: "bolt",
    subtitle: "First thing after waking, before eating",
  },
];

// ─── 6. INTENSITY RULES (for coaching copy / coach.ts) ───────
export const JIMMY_INTENSITY_RULES = [
  {
    id: "log-sets",
    title: "Log every set",
    description:
      "Weight and reps, every single set. Next week you must match or beat it. You can't quit a set without a record of quitting.",
  },
  {
    id: "two-more-reps",
    title: "The 2 more reps rule",
    description:
      "When your brain says stop, do exactly 2 more reps. Every time. That's where muscle actually gets built.",
  },
  {
    id: "rest-timer",
    title: "Strict 60-90 sec rest",
    description:
      "Phone timer every set. When it goes off, you go. No scrolling, no conversations.",
  },
  {
    id: "one-song-one-set",
    title: "One song, one set",
    description:
      "Build a playlist where each song = one set. When the song starts, the set starts. No negotiating.",
  },
];

// ─── 7. PROGRESS GOAL ────────────────────────────────────────
export const JIMMY_PROGRESS_GOAL = {
  startingWeight: 175,
  goalWeightLow: 160,
  goalWeightHigh: 165,
  targetBodyFatPct: "10-12%",
  timelineWeeks: 12,
  note: "10-15 lbs of fat loss reveals the muscle already there. No bulk needed — just reveal.",
};

export const JIMMY_PROGRESS_GOAL_CONFIG: ProgressGoalConfig = {
  goalWeightLowLbs: JIMMY_PROGRESS_GOAL.goalWeightLow,
  goalWeightHighLbs: JIMMY_PROGRESS_GOAL.goalWeightHigh,
  progressStartWeightLbs: JIMMY_PROGRESS_GOAL.startingWeight,
};

// ─── Normalizers (app shapes) ────────────────────────────────

export function jimmyRoutinesToWorkoutTemplates(routines: Routine[]): WorkoutRoutineTemplate[] {
  return routines.map((r) => ({
    id: r.id,
    name: r.name,
    dayLabel: r.dayLabel,
    focus: r.tag,
    warmupItems: r.warmup,
    warmupTip: r.warmupTip,
    sessionTip: r.tip,
    exercises: r.exercises.map((ex, ei) => ({
      id: `${r.id}-ex-${ei}`,
      name: ex.name,
      target: `${ex.sets} × ${ex.reps}`,
      ...(ex.notes?.trim() ? { label: ex.notes.trim() } : {}),
      sets: Array.from({ length: Math.min(Math.max(ex.sets, 1), 12) }, () => ({ w: 0, r: 0, done: false })),
    })),
  }));
}

export const JIMMY_WORKOUT_TEMPLATES: WorkoutRoutineTemplate[] = jimmyRoutinesToWorkoutTemplates(JIMMY_ROUTINES);

const _presetsT0 = Date.now();
/** Nutrition presets with `lastUsedAtMs` — same entries as `JIMMY_NUTRITION_PRESETS_RAW`. */
export const JIMMY_NUTRITION_PRESETS: NutritionPreset[] = JIMMY_NUTRITION_PRESETS_RAW.map((p, i) => ({
  ...p,
  lastUsedAtMs: _presetsT0 - i * 1000,
}));

/** Main meals/snacks to surface as quick-add chips on Nutrition → Today. */
export const JIMMY_QUICK_ADD_PRESET_IDS: string[] = [
  "pre-workout-banana",
  "post-workout-shake",
  "fairlife-chocolate",
  "meal-prep-lunch",
  "afternoon-snack",
  "dinner-chicken",
  "dinner-tbone",
  "canes-3-piece",
];

// ─── 8. SEED ─────────────────────────────────────────────────

/** Merge Jimmy's plan into persisted storage (nutrition, routines, habits, targets, progress goal). Preserves logs & completion data. */
export function seedJimmyData(): void {
  const base = sliceFromAppState(buildAppStateFromPersisted(loadPersistedSlice()));
  const suggested = jimmySuggestedRoutineIdForDate(new Date());
  const splitId =
    base.workout.sessionPhase === "lifting"
      ? base.workout.splitId
      : suggested && JIMMY_WORKOUT_TEMPLATES.some((t) => t.id === suggested)
        ? suggested
        : JIMMY_WORKOUT_TEMPLATES[0]?.id ?? base.workout.splitId;

  savePersistedSlice({
    ...base,
    displayName: JIMMY_SETTINGS.displayName,
    nutritionTargets: { ...JIMMY_NUTRITION_TARGETS },
    nutritionPresets: JIMMY_NUTRITION_PRESETS,
    workoutTemplates: JIMMY_WORKOUT_TEMPLATES,
    habitTemplates: JIMMY_HABITS,
    planStartIso: new Date().toISOString().split("T")[0],
    stepsTarget: JIMMY_SETTINGS.dailyStepsGoal,
    progressGoal: { ...JIMMY_PROGRESS_GOAL_CONFIG },
    onboardingCompleted: true,
    workout: {
      ...base.workout,
      splitId,
    },
  });
}

/** Persist Jimmy’s plan and return the new in-memory app state (use with `setState`). */
export function refreshStateAfterJimmySeed(): AppState {
  seedJimmyData();
  return buildAppStateFromPersisted(loadPersistedSlice());
}

// ─── 9. DAILY MEAL SCHEDULE (re-export; source in jimmyWeekly.ts) ──

// ─── 10. WEEKLY SCHEDULE (re-export; source of truth in jimmyWeekly.ts) ──

// ─── 11. SUNDAY MEAL PREP CHECKLIST ──────────────────────────
export const SUNDAY_PREP_STEPS = [
  "Sprouts grocery run — check grocery list",
  "Brown 800g 93/7 ground beef (salt, pepper, garlic powder)",
  "Cube and roast 800g sweet potato at 400°F for 25 min",
  "Steam or chop 400g spinach or broccoli",
  "Divide into 4 containers — 200g beef, 200g sweet potato, 100g veg each",
  "Refrigerate — Mon through Thu lunch is done",
];

// ─── 12. GROCERY LIST ────────────────────────────────────────
export const JIMMY_GROCERY_LIST = [
  { item: "93/7 ground beef", amount: "800g+", store: "Sprouts" },
  { item: "Sweet potatoes", amount: "1.5kg", store: "Sprouts" },
  { item: "Lean deli turkey slices", amount: "600g+", store: "Sprouts" },
  { item: "Oikos Greek yogurt cups", amount: "5 pack", store: "Any" },
  { item: "Spinach or broccoli", amount: "500g+", store: "Sprouts" },
  { item: "Bananas", amount: "12", store: "Any" },
  { item: "Frozen strawberries", amount: "1 bag", store: "Any" },
  { item: "Almond milk", amount: "1 carton", store: "Any" },
  { item: "Eggs", amount: "12 count", store: "Any" },
  { item: "Fairlife chocolate milk", amount: "2-3 bottles (backup)", store: "Any" },
  {
    item: "Chicken breast or steak",
    amount: "Whatever mom needs",
    store: "Sprouts",
  },
];
