export type StretchBlock = {
  id: string;
  title: string;
  minutes?: string;
  cues: readonly string[];
};

export const STRETCH_INTRO =
  "Keep everything easy, nasal breathing where you can. Nothing should feel sharp or pinchy.";

export const STRETCH_BLOCKS: StretchBlock[] = [
  { id: "settle", title: "Settle in", minutes: "~2 min", cues: ["Slow breathing", "Soften jaw and hips"] },
  { id: "child-pose", title: "Child's pose breathing", minutes: "~2 min", cues: ["Reach arms forward", "Exhale and sink"] },
  { id: "couch-stretch", title: "Couch stretch", minutes: "~2 min each side", cues: ["Hip flexor stretch", "Ribs down slightly"] },
  { id: "hamstrings", title: "Hamstrings", minutes: "~90 sec each side", cues: ["Hinge from hips", "Micro-bend knees"] },
  { id: "figure-four", title: "Figure-4 glute", minutes: "~90 sec each side", cues: ["Ankle on knee", "Mild stretch only"] },
];
