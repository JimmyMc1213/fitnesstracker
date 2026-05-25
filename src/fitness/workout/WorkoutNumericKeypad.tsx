import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "framer-motion";

import { IconArrowDown, IconKeyboard, IconMinus, IconPlus } from "../icons";
import { MOTION_DURATIONS } from "../motion";
import { useWorkoutKeypad } from "./WorkoutKeypadContext";
import { keypadIncrementStep } from "./workoutKeypadLogic";

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

const KEYPAD_ENTER_TRANSITION: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
};

const KEYPAD_EXIT_TRANSITION: Transition = {
  duration: MOTION_DURATIONS.sheetExit / 1000,
  ease: [0.4, 0, 1, 1],
};

function workoutKeypadVariants(reduceMotion: boolean): Variants {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }
  return {
    initial: { y: "100%" },
    animate: { y: 0, transition: KEYPAD_ENTER_TRANSITION },
    exit: { y: "100%", transition: KEYPAD_EXIT_TRANSITION },
  };
}

function WorkoutKeypadPanel({
  weightUnit,
  active,
  close,
  append,
  backspace,
  increment,
  next,
}: {
  weightUnit: "lbs" | "kg";
  active: NonNullable<ReturnType<typeof useWorkoutKeypad>["active"]>;
  close: () => void;
  append: (key: string) => void;
  backspace: () => void;
  increment: (delta: number) => void;
  next: () => void;
}) {
  const step = keypadIncrementStep(active.field, weightUnit);
  const allowDecimal = active.field === "weight";

  return (
    <>
      {DIGIT_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="workout-keypad__row">
          {row.map((digit) => (
            <button key={digit} type="button" className="workout-keypad__key tap" onClick={() => append(digit)}>
              {digit}
            </button>
          ))}
          {rowIndex === 0 ? (
            <button type="button" className="workout-keypad__key workout-keypad__key--action tap" aria-label="Hide keyboard" onClick={close}>
              <span className="workout-keypad__dismiss-icons">
                <IconKeyboard size={20} stroke={1.6} />
                <IconArrowDown size={14} stroke={2.2} />
              </span>
            </button>
          ) : null}
          {rowIndex === 1 ? (
            <button
              type="button"
              className="workout-keypad__key workout-keypad__key--action tap"
              aria-label={`Increase by ${step}`}
              onClick={() => increment(step)}
            >
              <IconPlus size={20} stroke={2.2} />
            </button>
          ) : null}
          {rowIndex === 2 ? (
            <div className="workout-keypad__stepper">
              <button
                type="button"
                className="workout-keypad__stepper-btn tap"
                aria-label={`Decrease by ${step}`}
                onClick={() => increment(-step)}
              >
                <IconMinus size={18} stroke={2.2} />
              </button>
              <button
                type="button"
                className="workout-keypad__stepper-btn tap"
                aria-label={`Increase by ${step}`}
                onClick={() => increment(step)}
              >
                <IconPlus size={18} stroke={2.2} />
              </button>
            </div>
          ) : null}
        </div>
      ))}

      <div className="workout-keypad__row">
        <button
          type="button"
          className="workout-keypad__key tap"
          disabled={!allowDecimal}
          aria-label="Decimal point"
          onClick={() => append(".")}
        >
          .
        </button>
        <button type="button" className="workout-keypad__key tap" onClick={() => append("0")}>
          0
        </button>
        <button type="button" className="workout-keypad__key workout-keypad__key--action tap" aria-label="Delete" onClick={backspace}>
          ⌫
        </button>
        <button type="button" className="workout-keypad__key workout-keypad__key--next tap" onClick={next}>
          Next
        </button>
      </div>
    </>
  );
}

export function WorkoutNumericKeypad({ weightUnit }: { weightUnit: "lbs" | "kg" }) {
  const { open, active, close, append, backspace, increment, next } = useWorkoutKeypad();
  const reduceMotion = useReducedMotion();
  const variants = workoutKeypadVariants(!!reduceMotion);

  return (
    <AnimatePresence>
      {open && active ? (
        <motion.div
          key="workout-keypad"
          className="workout-keypad"
          role="group"
          aria-label="Workout number pad"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <WorkoutKeypadPanel
            weightUnit={weightUnit}
            active={active}
            close={close}
            append={append}
            backspace={backspace}
            increment={increment}
            next={next}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
