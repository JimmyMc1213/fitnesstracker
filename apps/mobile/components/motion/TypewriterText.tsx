import { useEffect, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useReducedMotion } from "./useReducedMotion";

type TypewriterTextProps = {
  text: string;
  /** Per-character delay in ms. */
  speed?: number;
  startDelayMs?: number;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
};

/** Single-pass typewriter for one message (no delete / word cycling). RN port of the PWA `TypewriterText`. */
export function TypewriterText({
  text,
  speed = 32,
  startDelayMs = 0,
  cursor = true,
  cursorChar = "|",
  className,
  style,
}: TypewriterTextProps) {
  const { ob } = useOnboardingTheme();
  const reducedMotion = useReducedMotion();

  const [displayText, setDisplayText] = useState(reducedMotion ? text : "");
  const [started, setStarted] = useState(startDelayMs === 0 || reducedMotion);
  const [complete, setComplete] = useState(reducedMotion);
  const [charIndex, setCharIndex] = useState(reducedMotion ? text.length : 0);
  const [showCursor, setShowCursor] = useState(true);

  // Reduced-motion can resolve after mount; collapse to the full string when it flips on.
  useEffect(() => {
    if (!reducedMotion) return;
    setDisplayText(text);
    setCharIndex(text.length);
    setStarted(true);
    setComplete(true);
  }, [reducedMotion, text]);

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

  const cursorVisible = complete ? showCursor : true;

  return (
    <Text className={className} style={style} accessibilityLabel={text}>
      {displayText}
      {cursor && started && !reducedMotion ? (
        <Text style={{ color: ob.coachBlueLabel, opacity: cursorVisible ? 1 : 0 }}>{cursorChar}</Text>
      ) : null}
    </Text>
  );
}
