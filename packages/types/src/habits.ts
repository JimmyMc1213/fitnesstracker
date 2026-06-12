export type HabitType = "manual" | "action";
export type HabitAction = "openWeighIn";

/** Habit row template (completion lives in `habitsDoneByDay` + today’s `habits` list). */
export type HabitTemplate = {
  id: string;
  name: string;
  icon: string;
  /** Secondary line in the Habits list when present. */
  subtitle?: string;
  type?: HabitType;
  action?: HabitAction;
};

export type Habit = HabitTemplate & {
  done: boolean;
};
