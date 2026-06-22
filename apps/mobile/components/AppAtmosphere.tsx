import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { useAppTheme } from "@/hooks/useAppTheme";

/**
 * Atmospheric background ported from the PWA's `body::before` layer
 * (apps/pwa/src/index.css). Soft elliptical blue + violet blobs over a base
 * vignette and a faint vertical gradient. Themed for light and dark.
 *
 * RN SVG ignores alpha inside `stopColor="rgba(...)"`, so every stop carries an
 * explicit `stopOpacity`. Radial blobs use objectBoundingBox units (fractions of
 * the full-screen Rect), matching the CSS `radial-gradient(ellipse W H at X Y)`
 * sizing where rx/ry are fractions of width/height and cx/cy are the center.
 */

type GradientStop = { offset: number; color: string; opacity: number };

type RadialBlob = {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  stops: GradientStop[];
};

type AtmosphereConfig = {
  /** Painted bottom-to-top; the last blob sits on top (matches CSS list order reversed). */
  blobs: RadialBlob[];
  /** Vertical `--body-atmosphere` linear gradient drawn beneath the blobs. */
  atmosphere: GradientStop[];
};

const DARK_ATMOSPHERE: AtmosphereConfig = {
  blobs: [
    {
      id: "atm-vignette",
      cx: 0.5,
      cy: 0.38,
      rx: 1.4,
      ry: 0.95,
      stops: [
        { offset: 0.32, color: "rgb(0, 0, 0)", opacity: 0 },
        { offset: 1, color: "rgb(0, 0, 0)", opacity: 0.52 },
      ],
    },
    {
      id: "atm-violet",
      cx: 1.02,
      cy: 1.08,
      rx: 0.9,
      ry: 0.75,
      stops: [
        { offset: 0, color: "rgb(124, 106, 210)", opacity: 0.07 },
        { offset: 0.5, color: "rgb(124, 106, 210)", opacity: 0 },
      ],
    },
    {
      id: "atm-blue",
      cx: 0.08,
      cy: -0.08,
      rx: 1.1,
      ry: 0.85,
      stops: [
        { offset: 0, color: "rgb(10, 132, 255)", opacity: 0.1 },
        { offset: 0.54, color: "rgb(10, 132, 255)", opacity: 0 },
      ],
    },
  ],
  atmosphere: [
    { offset: 0, color: "rgb(255, 255, 255)", opacity: 0.012 },
    { offset: 0.28, color: "rgb(255, 255, 255)", opacity: 0 },
    { offset: 0.72, color: "rgb(0, 0, 0)", opacity: 0 },
    { offset: 1, color: "rgb(0, 0, 0)", opacity: 0.22 },
  ],
};

const LIGHT_ATMOSPHERE: AtmosphereConfig = {
  blobs: [
    {
      id: "atm-vignette",
      cx: 0.5,
      cy: 0.38,
      rx: 1.4,
      ry: 0.95,
      stops: [
        { offset: 0.42, color: "rgb(0, 0, 0)", opacity: 0 },
        { offset: 1, color: "rgb(0, 0, 0)", opacity: 0.04 },
      ],
    },
    {
      id: "atm-violet",
      cx: 1.02,
      cy: 1.08,
      rx: 0.95,
      ry: 0.8,
      stops: [
        { offset: 0, color: "rgb(124, 106, 210)", opacity: 0.18 },
        { offset: 0.38, color: "rgb(124, 106, 210)", opacity: 0.07 },
        { offset: 0.55, color: "rgb(124, 106, 210)", opacity: 0 },
      ],
    },
    {
      id: "atm-blue",
      cx: 0.08,
      cy: -0.08,
      rx: 1.15,
      ry: 0.92,
      stops: [
        { offset: 0, color: "rgb(10, 132, 255)", opacity: 0.34 },
        { offset: 0.34, color: "rgb(10, 132, 255)", opacity: 0.14 },
        { offset: 0.58, color: "rgb(10, 132, 255)", opacity: 0 },
      ],
    },
  ],
  atmosphere: [
    { offset: 0, color: "rgb(255, 255, 255)", opacity: 0.35 },
    { offset: 0.28, color: "rgb(255, 255, 255)", opacity: 0 },
    { offset: 0.72, color: "rgb(0, 0, 0)", opacity: 0 },
    { offset: 1, color: "rgb(0, 0, 0)", opacity: 0.03 },
  ],
};

const BODY_GRADIENT_ID = "atm-body";

export function AppAtmosphere() {
  const { scheme } = useAppTheme();
  const config = scheme === "light" ? LIGHT_ATMOSPHERE : DARK_ATMOSPHERE;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={BODY_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            {config.atmosphere.map((stop, index) => (
              <Stop
                key={`${BODY_GRADIENT_ID}-${index}`}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
              />
            ))}
          </LinearGradient>
          {config.blobs.map((blob) => (
            <RadialGradient
              key={blob.id}
              id={blob.id}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
            >
              {blob.stops.map((stop, index) => (
                <Stop
                  key={`${blob.id}-${index}`}
                  offset={stop.offset}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </RadialGradient>
          ))}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${BODY_GRADIENT_ID})`} />
        {config.blobs.map((blob) => (
          <Rect key={blob.id} x="0" y="0" width="100%" height="100%" fill={`url(#${blob.id})`} />
        ))}
      </Svg>
    </View>
  );
}
