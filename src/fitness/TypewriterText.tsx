import { useEffect, useMemo, useState } from "react";

type TypewriterTextProps = {
  text: string;
  speed?: number;
  startDelayMs?: number;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Single-pass typewriter for one message (no delete / word cycling). */
export function TypewriterText({
  text,
  speed = 32,
  startDelayMs = 0,
  cursor = true,
  cursorChar = "|",
  className,
}: TypewriterTextProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [displayText, setDisplayText] = useState(() => (reducedMotion ? text : ""));
  const [started, setStarted] = useState(startDelayMs === 0 || reducedMotion);
  const [complete, setComplete] = useState(reducedMotion);
  const [charIndex, setCharIndex] = useState(() => (reducedMotion ? text.length : 0));
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (startDelayMs <= 0 || reducedMotion) return;
    const timeout = setTimeout(() => setStarted(true), startDelayMs);
    return () => clearTimeout(timeout);
  }, [startDelayMs, reducedMotion]);

  useEffect(() => {
    if (!started || reducedMotion) return;

    if (charIndex >= text.length) {
      setComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(text.substring(0, charIndex + 1));
      setCharIndex(charIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [started, charIndex, text, speed, reducedMotion]);

  useEffect(() => {
    if (!cursor || !started || reducedMotion) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [cursor, started, reducedMotion]);

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">
        {displayText}
        {cursor && started && !reducedMotion ? (
          <span
            className="typewriter-text__cursor"
            style={{ opacity: complete ? (showCursor ? 1 : 0) : 1 }}
          >
            {cursorChar}
          </span>
        ) : null}
      </span>
    </p>
  );
}
