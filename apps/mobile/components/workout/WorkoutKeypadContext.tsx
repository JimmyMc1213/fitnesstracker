import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { parseSetWeightInput } from "@/lib/workout/parseSetWeightInput";
import {
  advanceWorkoutKeypad,
  appendKeypadDigit,
  applyKeypadIncrement,
  backspaceKeypadDraft,
  workoutKeypadTargetKey,
  type WorkoutKeypadTarget,
} from "@/lib/workout/workoutKeypadLogic";
import { formatSetWeight } from "@newyouai/core";
import type { WeightUnit, WorkoutExercise } from "@newyouai/types";

export const WORKOUT_KEYPAD_HEIGHT = 248;

type WorkoutKeypadContextValue = {
  active: WorkoutKeypadTarget | null;
  draft: string;
  open: boolean;
  openField: (target: WorkoutKeypadTarget) => void;
  close: () => void;
  append: (key: string) => void;
  backspace: () => void;
  increment: (delta: number) => void;
  next: () => void;
  isActive: (target: WorkoutKeypadTarget) => boolean;
};

const WorkoutKeypadContext = createContext<WorkoutKeypadContextValue | null>(null);

export function useWorkoutKeypad() {
  const ctx = useContext(WorkoutKeypadContext);
  if (!ctx) throw new Error("useWorkoutKeypad must be used within WorkoutKeypadProvider");
  return ctx;
}

export function fieldElementId(target: WorkoutKeypadTarget): string {
  return `workout-set-${target.exerciseId}-${target.setIndex}-${target.field === "weight" ? "weight" : "reps"}`;
}

export function WorkoutKeypadProvider({
  exercises,
  weightUnit,
  onUpdateSet,
  onCompleteSet,
  onScrollToField,
  children,
}: {
  exercises: WorkoutExercise[];
  weightUnit: WeightUnit;
  onUpdateSet: (exerciseId: string, setIndex: number, patch: Partial<{ w: number; r: number }>) => void;
  onCompleteSet?: (
    exerciseId: string,
    setIndex: number,
    pendingPatch?: Partial<{ w: number; r: number }>,
  ) => boolean;
  onScrollToField?: (target: WorkoutKeypadTarget) => void;
  children: ReactNode;
}) {
  const [active, setActive] = useState<WorkoutKeypadTarget | null>(null);
  const [draft, setDraft] = useState("");
  const keypadWasOpenRef = useRef(false);
  const liveSetValuesRef = useRef(new Map<string, { w: number; r: number }>());

  useEffect(() => {
    const next = new Map<string, { w: number; r: number }>();
    for (const exercise of exercises) {
      exercise.sets.forEach((set, setIndex) => {
        next.set(`${exercise.id}:${setIndex}`, { w: set.w, r: set.r });
      });
    }
    liveSetValuesRef.current = next;
  }, [exercises]);

  const commit = useCallback(
    (target: WorkoutKeypadTarget, value: string) => {
      const key = `${target.exerciseId}:${target.setIndex}`;
      const prev = liveSetValuesRef.current.get(key) ?? { w: 0, r: 0 };
      const patch =
        target.field === "weight"
          ? { w: parseSetWeightInput(value, weightUnit) }
          : { r: parseInt(value, 10) || 0 };
      liveSetValuesRef.current.set(key, { ...prev, ...patch });
      onUpdateSet(target.exerciseId, target.setIndex, patch);
    },
    [onUpdateSet, weightUnit],
  );

  const draftForTarget = useCallback(
    (target: WorkoutKeypadTarget): string => {
      const exercise = exercises.find((e) => e.id === target.exerciseId);
      const set = exercise?.sets[target.setIndex];
      if (!set) return "";
      if (target.field === "weight") {
        return set.w > 0 ? formatSetWeight(set.w, weightUnit) : "";
      }
      return set.r > 0 ? String(set.r) : "";
    },
    [exercises, weightUnit],
  );

  const openField = useCallback(
    (target: WorkoutKeypadTarget) => {
      setActive(target);
      setDraft(draftForTarget(target));
    },
    [draftForTarget],
  );

  const close = useCallback(() => {
    setActive(null);
    setDraft("");
  }, []);

  useEffect(() => {
    if (!active) {
      keypadWasOpenRef.current = false;
      return;
    }

    const scrollDelayMs = keypadWasOpenRef.current ? 0 : 240;
    keypadWasOpenRef.current = true;

    const timer = setTimeout(() => {
      onScrollToField?.(active);
    }, scrollDelayMs);

    return () => clearTimeout(timer);
  }, [active, onScrollToField]);

  const applyDraft = useCallback(
    (nextDraft: string) => {
      if (!active) return;
      setDraft(nextDraft);
      commit(active, nextDraft);
    },
    [active, commit],
  );

  const append = useCallback(
    (key: string) => {
      if (!active) return;
      const allowDecimal = active.field === "weight";
      applyDraft(appendKeypadDigit(draft, key, allowDecimal));
    },
    [active, applyDraft, draft],
  );

  const backspace = useCallback(() => {
    if (!active) return;
    applyDraft(backspaceKeypadDraft(draft));
  }, [active, applyDraft, draft]);

  const increment = useCallback(
    (delta: number) => {
      if (!active) return;
      applyDraft(applyKeypadIncrement(draft, active.field, delta, weightUnit));
    },
    [active, applyDraft, draft, weightUnit],
  );

  const next = useCallback(() => {
    if (!active) return;
    commit(active, draft);
    const { completeSet, nextTarget } = advanceWorkoutKeypad(exercises, active);
    if (completeSet) {
      const live = liveSetValuesRef.current.get(`${completeSet.exerciseId}:${completeSet.setIndex}`);
      const completed =
        onCompleteSet?.(completeSet.exerciseId, completeSet.setIndex, live) ?? true;
      if (!completed) return;
    }
    if (!nextTarget) {
      close();
      return;
    }
    openField(nextTarget);
  }, [active, close, commit, draft, exercises, onCompleteSet, openField]);

  const isActive = useCallback(
    (target: WorkoutKeypadTarget) =>
      active != null && workoutKeypadTargetKey(active) === workoutKeypadTargetKey(target),
    [active],
  );

  const value = useMemo(
    () => ({
      active,
      draft,
      open: active != null,
      openField,
      close,
      append,
      backspace,
      increment,
      next,
      isActive,
    }),
    [active, append, backspace, close, draft, increment, isActive, next, openField],
  );

  return <WorkoutKeypadContext.Provider value={value}>{children}</WorkoutKeypadContext.Provider>;
}
