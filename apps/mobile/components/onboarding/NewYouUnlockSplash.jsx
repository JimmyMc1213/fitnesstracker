/**
 * NewYouUnlockSplash — premium "Aurora" unlock animation for React Native.
 * Mirrors the PWA implementation: RAF-driven SVG updates (no Reanimated SVG transforms).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Line,
} from "react-native-svg";

const RAY_COUNT = 9;
const PARTICLE_COUNT = 14;
const DURATION = 2700;
const START_DELAY = 160;

function lerp(keys, values, t) {
  if (t <= keys[0]) return values[0];
  if (t >= keys[keys.length - 1]) return values[values.length - 1];

  for (let i = 0; i < keys.length - 1; i += 1) {
    if (t >= keys[i] && t <= keys[i + 1]) {
      const span = keys[i + 1] - keys[i];
      if (span === 0) return values[i + 1];
      const local = (t - keys[i]) / span;
      return values[i] + (values[i + 1] - values[i]) * local;
    }
  }

  return values[values.length - 1];
}

function clampLerp(keys, values, t) {
  const clamped = Math.max(keys[0], Math.min(keys[keys.length - 1], t));
  return lerp(keys, values, clamped);
}

export default function NewYouUnlockSplash({
  gold = "#c9a876",
  goldHi = "#ecd8ac",
  goldDeep = "#9c8050",
  headline = "NewYou",
  onFinish,
  /** When false, hold at progress 0 (dark backdrop only) until the confirming layer clears. */
  active = true,
}) {
  const { width: W, height: H } = useWindowDimensions();
  const CX = W / 2;
  const CY = H * 0.4;
  const SCALE = 0.78;
  const RAY_LEN = Math.min(W, H) * 0.34;
  const lockTransform = `translate(${CX - 100 * SCALE} ${CY - 120 * SCALE}) scale(${SCALE})`;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const [progress, setProgress] = useState(0);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 130;
        return {
          tx: Math.cos(a) * d,
          ty: Math.sin(a) * d - 18,
          r: 1.6 + Math.random() * 2.4,
          color: i % 3 ? gold : goldHi,
        };
      }),
    [gold, goldHi],
  );

  const rays = useMemo(
    () =>
      Array.from({ length: RAY_COUNT }, (_, i) => {
        const a = ((Math.PI * 2) / RAY_COUNT) * i - Math.PI / 2;
        return { x2: CX + Math.cos(a) * RAY_LEN, y2: CY + Math.sin(a) * RAY_LEN };
      }),
    [CX, CY, RAY_LEN],
  );

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return undefined;
    }

    let raf = 0;
    const start = Date.now() + START_DELAY;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.max(0, Math.min(1, elapsed / DURATION));
      setProgress(p);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      onFinishRef.current?.();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const glowRadius = lerp(
    [0, 0.05, 0.5, 0.66, 1],
    [W * 0.18, W * 0.18, W * 0.34, W * 0.42, W * 0.4],
    progress,
  );
  const glowOpacity = lerp([0, 0.05, 0.5, 0.66, 1], [0, 0, 0.55, 1, 0.78], progress);

  const rayScale = lerp([0, 0.5, 0.62, 0.78, 1], [0.15, 0.15, 1, 1.2, 1.2], progress);
  const rayOpacity = lerp([0, 0.5, 0.62, 0.78, 0.9, 1], [0, 0, 0.85, 0.4, 0, 0], progress);
  const rayTransform = `translate(${CX} ${CY}) scale(${rayScale}) translate(${-CX} ${-CY})`;

  const burst1Radius = lerp([0, 0.55, 0.82, 1], [20, 20, 130, 130], progress);
  const burst1Opacity = clampLerp([0.53, 0.6, 0.82], [0, 0.9, 0], progress);
  const burst2Radius = lerp([0, 0.58, 0.86, 1], [20, 20, 130, 130], progress);
  const burst2Opacity = clampLerp([0.56, 0.63, 0.86], [0, 0.6, 0], progress);

  const bodyScale = lerp(
    [0, 0.08, 0.12, 0.16, 0.55, 0.62, 0.68, 1],
    [0.55, 1, 0.965, 1, 1, 1.04, 1, 1],
    progress,
  );
  const bodyOpacity = clampLerp([0, 0.08], [0, 1], progress);
  const bodyTransform = `translate(100 154) scale(${bodyScale}) translate(-100 -154)`;

  const shackleLift = clampLerp([0, 0.42, 0.53, 0.6, 1], [0, 0, -26, -22, -22], progress);
  const shackleRot = clampLerp([0, 0.55, 0.66, 0.72, 1], [0, 0, 35, 32, 32], progress);
  const shackleTransform = `translate(0 ${shackleLift}) rotate(${shackleRot} 136 100)`;

  const copyOpacity = clampLerp([0.6, 0.78], [0, 1], progress);
  const copyTranslateY = clampLerp([0.6, 0.78], [18, 0], progress);

  return (
    <View style={styles.root}>
      <Svg width={W} height={H}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gold} stopOpacity="1" />
            <Stop offset="66%" stopColor={gold} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="body" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor={goldHi} />
            <Stop offset="0.45" stopColor={gold} />
            <Stop offset="1" stopColor={goldDeep} />
          </LinearGradient>
        </Defs>

        <Circle cx={CX} cy={CY} fill="url(#glow)" r={glowRadius} opacity={glowOpacity} />

        <G transform={rayTransform} opacity={rayOpacity}>
          {rays.map((r, i) => (
            <Line
              key={i}
              x1={CX}
              y1={CY}
              x2={r.x2}
              y2={r.y2}
              stroke={goldHi}
              strokeWidth={2.5}
              strokeOpacity={0.55}
              strokeLinecap="round"
            />
          ))}
        </G>

        <Circle
          cx={CX}
          cy={CY}
          fill="none"
          stroke={gold}
          strokeWidth={1.5}
          r={burst1Radius}
          opacity={burst1Opacity}
        />
        <Circle
          cx={CX}
          cy={CY}
          fill="none"
          stroke={goldHi}
          strokeWidth={1}
          r={burst2Radius}
          opacity={burst2Opacity}
        />

        {particles.map((pt, i) => {
          const t = clampLerp([0, 0.55, 0.85, 1], [0, 0, 1, 1], progress);
          const opacity = clampLerp([0.5, 0.58, 0.82, 0.92], [0, 1, 0.6, 0], progress);
          return (
            <Circle
              key={i}
              cx={CX + pt.tx * t}
              cy={CY + pt.ty * t}
              r={pt.r}
              fill={pt.color}
              opacity={opacity}
            />
          );
        })}

        <G transform={lockTransform}>
          <G transform={shackleTransform}>
            <Path
              d="M64 102 V72 a36 36 0 0 1 72 0 V102"
              fill="none"
              stroke={gold}
              strokeWidth={15}
              strokeLinecap="round"
            />
          </G>
          <G opacity={bodyOpacity} transform={bodyTransform}>
            <Rect x={44} y={100} width={112} height={108} rx={24} fill="url(#body)" />
            <Circle cx={100} cy={143} r={13} fill="#0a0a0b" />
            <Path d="M95 152 h10 l-2.5 26 h-5 z" fill="#0a0a0b" />
          </G>
        </G>
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.copy,
          { top: H * 0.6, opacity: copyOpacity, transform: [{ translateY: copyTranslateY }] },
        ]}
      >
        <View style={styles.kickerRow}>
          <View style={styles.kickerLine} />
          <Text style={styles.kicker}>MEMBERSHIP UNLOCKED</Text>
          <View style={styles.kickerLine} />
        </View>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={[styles.headline, { color: gold }]}>{headline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#08070a", alignItems: "center", justifyContent: "center" },
  copy: { position: "absolute", left: 0, right: 0, alignItems: "center", paddingHorizontal: 28 },
  kickerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  kickerLine: { width: 18, height: 1, backgroundColor: "#c9a876", opacity: 0.6, marginHorizontal: 9 },
  kicker: { fontSize: 10.5, letterSpacing: 3.4, color: "#c9a876", fontWeight: "600" },
  welcome: {
    fontFamily: "CormorantGaramond-MediumItalic",
    fontStyle: "italic",
    fontSize: 25,
    color: "#d8cfbd",
    lineHeight: 26,
  },
  headline: {
    fontFamily: "CormorantGaramond-SemiBold",
    fontSize: 62,
    fontWeight: "600",
    lineHeight: 64,
    marginTop: 2,
  },
});
