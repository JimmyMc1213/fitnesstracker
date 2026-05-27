import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

type Props = {
  value: string;
  className?: string;
  style?: CSSProperties;
};

/** Flip-in/out digit display when `value` changes (no card/chrome). */
export function AnimatedNumberFlip({ value, className, style }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <span className={className} style={{ ...style, display: "inline-block" }}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        ...style,
        display: "inline-grid",
        overflow: "hidden",
        verticalAlign: "bottom",
        perspective: 200,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          style={{ gridArea: "1 / 1", display: "inline-block" }}
          initial={{ y: "-80%", opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: "80%", opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
