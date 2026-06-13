import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";

export const CHART_PAD_LEFT = 12;
export const CHART_PAD_RIGHT = 36;

type Props = {
  data: number[];
  width: number;
  height?: number;
  padLeft?: number;
  padRight?: number;
  padY?: number;
  stroke: string;
  gridColor: string;
  fillColor: string;
  tickColor: string;
};

export function WeightLineChart({
  data,
  width,
  height = 140,
  padLeft = CHART_PAD_LEFT,
  padRight = CHART_PAD_RIGHT,
  padY = 16,
  stroke,
  gridColor,
  fillColor,
  tickColor,
}: Props) {
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;
  const w = Math.max(1, width - padLeft - padRight);
  const h = height - padY * 2;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const pts = data.map((v, i) => [padLeft + i * stepX, padY + h - ((v - min) / range) * h] as const);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1]![0]} ${padY + h} L${pts[0]![0]} ${padY + h} Z`;
  const ticks = [max, (max + min) / 2, min];
  const tickTextX = width - 6;
  const gridRight = width - padRight;

  return (
    <Svg width={width} height={height}>
      {ticks.map((t, i) => {
        const y = padY + (i / 2) * h;
        return (
          <G key={i}>
            <Line x1={padLeft} x2={gridRight} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
            <SvgText x={tickTextX} y={y - 3} textAnchor="end" fill={tickColor} fontSize={9}>
              {t.toFixed(1)}
            </SvgText>
          </G>
        );
      })}
      <Path d={area} fill={fillColor} />
      <Path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) =>
        i === pts.length - 1 ? <Circle key={i} cx={p[0]} cy={p[1]} r={3} fill={stroke} /> : null,
      )}
    </Svg>
  );
}
