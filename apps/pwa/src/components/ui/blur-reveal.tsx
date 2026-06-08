import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type BlurRevealProps = {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** When set, reveals when true instead of waiting for scroll into view. */
  active?: boolean;
  as?: "span" | "div";
};

export function BlurReveal({
  className,
  children,
  delay = 0,
  duration = 1,
  active,
  as = "span",
}: BlurRevealProps) {
  const ref = React.useRef<HTMLSpanElement | HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true });
  const shouldReveal = active ?? inView;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={cn(className)}>{children}</Tag>;
  }

  const initial =
    as === "div" ?
      { opacity: 0, filter: "blur(12px)" }
    : { opacity: 0, filter: "blur(10px)", y: "20%" };
  const animate = shouldReveal ? { opacity: 1, filter: "blur(0px)", y: 0 } : initial;

  if (as === "div") {
    return (
      <motion.div
        ref={ref as React.RefObject<HTMLDivElement>}
        initial={initial}
        animate={animate}
        transition={{ duration, delay }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.span
      ref={ref as React.RefObject<HTMLSpanElement>}
      initial={initial}
      animate={animate}
      transition={{ duration, delay }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}
