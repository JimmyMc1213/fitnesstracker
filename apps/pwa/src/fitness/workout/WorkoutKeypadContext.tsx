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

import { formatSetWeight, parseSetWeightInput } from "../unitPreferences";
import type { WeightUnit, WorkoutExercise } from "../types";
import {
  advanceWorkoutKeypad,
  appendKeypadDigit,
  applyKeypadIncrement,
  backspaceKeypadDraft,
  workoutKeypadTargetKey,
  type WorkoutKeypadTarget,
} from "./workoutKeypadLogic";
import { scrollWorkoutFieldIntoView } from "./scrollWorkoutFieldIntoView";

type WorkoutKeypadContextValue = {
  active: WorkoutKeypadTarget | null;
  draft: string;
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

const WorkoutKeypadContext = createContext<WorkoutKeypadContextValue | null>(null);

export function useWorkoutKeypad() {
  const ctx = useContext(WorkoutKeypadContext);
  if (!ctx) throw new Error("useWorkoutKeypad must be used within WorkoutKeypadProvider");
  return ctx;
}

export function WorkoutKeypadProvider({
  exercises,
  weightUnit,
  onUpdateSet,
  onCompleteSet,
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
      const current = activeRef.current;
      if (
        current &&
        (current.exerciseId !== target.exerciseId ||
          current.setIndex !== target.setIndex ||
          current.field !== target.field)
      ) {
        commit(current, draftRef.current);
      }
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
    if (!active) {
      keypadWasOpenRef.current = false;
      return;
    }

    const fieldId = fieldElementId(active);
    const scrollDelayMs = keypadWasOpenRef.current ? 0 : 240;
    keypadWasOpenRef.current = true;

    const timer = window.setTimeout(() => {
      const fieldEl = document.getElementById(fieldId);
      if (fieldEl) scrollWorkoutFieldIntoView(fieldEl);
    }, scrollDelayMs);

    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".workout-keypad")) return;
      if (target.closest(".workout-set-field")) return;
      close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, close]);

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
      flushSetEntry,
      append,
      backspace,
      increment,
      next,
      isActive,
    }),
    [active, append, backspace, close, draft, flushSetEntry, increment, isActive, next, openField],
  );

  return <WorkoutKeypadContext.Provider value={value}>{children}</WorkoutKeypadContext.Provider>;
}

export function fieldElementId(target: WorkoutKeypadTarget): string {
  return `workout-set-${target.exerciseId}-${target.setIndex}-${target.field}`;
}
