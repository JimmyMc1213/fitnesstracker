/** Static copy for the nightly stretching flow, mirrors app coaching (low-back care, gentle mobility). */
export type StretchBlock = {
  id: string;
  title: string;
  minutes?: string;
  cues: readonly string[];
};

export const STRETCH_INTRO =
  "Keep everything easy, nasal breathing where you can. Nothing should feel sharp or pinchy; ease off and breathe into a mild stretch instead.";

export const STRETCH_BLOCKS: StretchBlock[] = [
  {
    id: "settle",
    title: "Settle in",
    minutes: "~2 min",
    cues: ["Lie on back or sit tall · slow exhale-longer-than-inhale for 8-10 breaths.", "Scan jaw, traps, hips, soften what you notice."],
  },
  {
    id: "child-pose-breathing",
    title: "Child’s pose breathing",
    minutes: "~2 min",
    cues: ["Knees wide or together, hips toward heels.", "Reach arms forward, forehead or cheek on floor.", "Inhale into low back ribs; exhale let chest sink slightly, no forcing."],
  },
  {
    id: "couch-stretch",
    title: "Couch stretch (hip flexor / quad)",
    minutes: "~2 min each side",
    cues: ["Back knee on cushion, shin up the wall/couch seat, opposite foot planted.", "Posterior tilt ribs down slightly, you should feel front hip, not low-back pinch.", "If kneeling is spicy, swap for a gentle standing quad stretch holding a wall."],
  },
  {
    id: "hamstrings",
    title: "Hamstrings",
    minutes: "~90 sec each side",
    cues: ["Seated toe-reach or supported standing hinge, spine long, hinge from hips.", "Micro-bend knees if tingling backs of knees."],
  },
  {
    id: "figure-four-glute",
    title: "Figure-4 glute",
    minutes: "~90 sec each side",
    cues: ["On back, ankle across knee, thread hands behind thigh or on shin.", "Gentle space in hip; breathe into outer glute.", "Alternative: pigeon light on bed height if hips allow."],
  },
  {
    id: "thoracic-openers",
    title: "Thoracic openers",
    minutes: "~3 min",
    cues: ["Side-lying “open book”, stacked knees/hips, peel top arm toward floor behind you.", "Or seated chair twist, ribs move, neck soft.", "~6 slow reps each side."],
  },
  {
    id: "dead-bugs-side-plank",
    title: "Dead bugs + side plank (activation, not smash)",
    minutes: "~4 min",
    cues: [
      "Dead bug: ribs down, exhale reach opposite arm/leg slowly, no arching off floor. 2×8 slow.",
      "Side plank on knees or full, short lever, ribs stacked. 2×15-25s each side.",
      "Stop if wrists or shoulders complain, shorten hold or elevate hand.",
    ],
  },
  {
    id: "downshift",
    title: "Downshift",
    minutes: "~1-2 min",
    cues: ["Legs-up-the-wall optional, or fetal side-lying.", "Three slow inhale/exhale, then lights out mindset."],
  },
];
