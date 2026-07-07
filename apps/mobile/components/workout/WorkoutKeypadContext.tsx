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
import { dismissKeyboard } from "@/lib/keyboard";
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

type WorkoutKeypadControlContextValue = {
  active: WorkoutKeypadTarget | null;
  open: boolean;
  openField: (target: WorkoutKeypadTarget) => void;
  close: () => void;
  /** Commit the active field for this set (if any) and return logged w/r for completion. */
  flushSetEntry: (exerciseId: string, setIndex: number) => Partial<{ w: number; r: number }> | undefined;
  append: (key: string) => void;
  backspace: () => void;
  increment: (delta: number) => void;
  next: () => void;
  isActive: (target: WorkoutKeypadTarget) => boolean;
};

const WorkoutKeypadControlContext = createContext<WorkoutKeypadControlContextValue | null>(null);
const WorkoutKeypadDraftContext = createContext<string | undefined>(undefined);

export function useWorkoutKeypad() {
  const ctx = useContext(WorkoutKeypadControlContext);
  if (!ctx) throw new Error("useWorkoutKeypad must be used within WorkoutKeypadProvider");
  return ctx;
}

export function useWorkoutKeypadDraft() {
  const draft = useContext(WorkoutKeypadDraftContext);
  if (draft === undefined) {
    throw new Error("useWorkoutKeypadDraft must be used within WorkoutKeypadProvider");
  }
  return draft;
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
  const activeRef = useRef<WorkoutKeypadTarget | null>(null);
  const draftRef = useRef("");

  activeRef.current = active;
  draftRef.current = draft;

  useEffect(() => {
    const next = new Map<string, { w: number; r: number }>();
    for (const exercise of exercises) {
      exercise.sets.forEach((set, setIndex) => {
        next.set(`${exercise.id}:${setIndex}`, { w: set.w, r: set.r });
      });
    }
    liveSetValuesRef.current = next;
  }, [exercises]);

  const patchForValue = useCallback(
    (target: WorkoutKeypadTarget, value: string) =>
      target.field === "weight"
        ? { w: parseSetWeightInput(value, weightUnit) }
        : { r: parseInt(value, 10) || 0 },
    [weightUnit],
  );

  // Update the in-memory mirror only; no global state write (keeps typing cheap).
  const updateLiveValue = useCallback(
    (target: WorkoutKeypadTarget, value: string) => {
      const key = `${target.exerciseId}:${target.setIndex}`;
      const prev = liveSetValuesRef.current.get(key) ?? { w: 0, r: 0 };
      liveSetValuesRef.current.set(key, { ...prev, ...patchForValue(target, value) });
    },
    [patchForValue],
  );

  // Flush the draft into global fitness state. Called on field transitions
  // (open another field / close / next), never on every keystroke.
  const commit = useCallback(
    (target: WorkoutKeypadTarget, value: string) => {
      updateLiveValue(target, value);
      onUpdateSet(target.exerciseId, target.setIndex, patchForValue(target, value));
    },
    [onUpdateSet, patchForValue, updateLiveValue],
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

  const sameTarget = (a: WorkoutKeypadTarget | null, b: WorkoutKeypadTarget) =>
    a != null && a.exerciseId === b.exerciseId && a.setIndex === b.setIndex && a.field === b.field;

  const openField = useCallback(
    (target: WorkoutKeypadTarget) => {
      dismissKeyboard();
      const current = activeRef.current;
      if (sameTarget(current, target)) return;
      if (current) commit(current, draftRef.current);
      setActive(target);
      setDraft(draftForTarget(target));
    },
    [commit, draftForTarget],
  );

  const close = useCallback(() => {
    const current = activeRef.current;
    if (current) commit(current, draftRef.current);
    setActive(null);
    setDraft("");
  }, [commit]);

  const flushSetEntry = useCallback(
    (exerciseId: string, setIndex: number): Partial<{ w: number; r: number }> | undefined => {
      const current = activeRef.current;
      if (current?.exerciseId === exerciseId && current.setIndex === setIndex) {
        commit(current, draftRef.current);
        activeRef.current = null;
        setActive(null);
        setDraft("");
      }
      const live = liveSetValuesRef.current.get(`${exerciseId}:${setIndex}`);
      if (!live) return undefined;
      const patch: Partial<{ w: number; r: number }> = {};
      if (live.w > 0) patch.w = live.w;
      if (live.r > 0) patch.r = live.r;
      return Object.keys(patch).length > 0 ? patch : undefined;
    },
    [commit],
  );

  useEffect(() => {
    if (!active) return;
    const exercise = exercises.find((e) => e.id === active.exerciseId);
    if (!exercise || active.setIndex >= exercise.sets.length) {
      close();
    }
  }, [active, close, exercises]);

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
      const current = activeRef.current;
      if (!current) return;
      setDraft(nextDraft);
      updateLiveValue(current, nextDraft);
    },
    [updateLiveValue],
  );

  const append = useCallback(
    (key: string) => {
      const current = activeRef.current;
      if (!current) return;
      const allowDecimal = current.field === "weight";
      applyDraft(appendKeypadDigit(draftRef.current, key, allowDecimal));
    },
    [applyDraft],
  );

  const backspace = useCallback(() => {
    if (!activeRef.current) return;
    applyDraft(backspaceKeypadDraft(draftRef.current));
  }, [applyDraft]);

  const increment = useCallback(
    (delta: number) => {
      const current = activeRef.current;
      if (!current) return;
      applyDraft(applyKeypadIncrement(draftRef.current, current.field, delta, weightUnit));
    },
    [applyDraft, weightUnit],
  );

  const next = useCallback(() => {
    const current = activeRef.current;
    if (!current) return;
    commit(current, draftRef.current);
    // Already flushed; null the ref so close()/openField() below don't re-commit.
    activeRef.current = null;
    const { completeSet, nextTarget } = advanceWorkoutKeypad(exercises, current);
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
  }, [close, commit, exercises, onCompleteSet, openField]);

  // Flush any un-committed draft to global state when the provider unmounts.
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(
    () => () => {
      const current = activeRef.current;
      if (current) commitRef.current(current, draftRef.current);
    },
    [],
  );

  const isActive = useCallback(
    (target: WorkoutKeypadTarget) =>
      active != null && workoutKeypadTargetKey(active) === workoutKeypadTargetKey(target),
    [active],
  );

  const controlValue = useMemo(
    () => ({
      active,
      open: active != null,
      openField,
      close,
      flushSetEntry,
      append,
      backspace,
      increment,
      next,
      isActive,
    }),
    [active, append, backspace, close, flushSetEntry, increment, isActive, next, openField],
  );

  return (
    <WorkoutKeypadControlContext.Provider value={controlValue}>
      <WorkoutKeypadDraftContext.Provider value={draft}>{children}</WorkoutKeypadDraftContext.Provider>
    </WorkoutKeypadControlContext.Provider>
  );
}
